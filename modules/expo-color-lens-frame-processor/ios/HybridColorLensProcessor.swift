import AVFoundation
import CoreImage
import Foundation
import NitroModules
import VisionCamera

private struct RGBTriplet {
  var r: Int
  var g: Int
  var b: Int
}

/// Nitro singleton — shared `pixelBuffer`, `bgraScratch`, and `histogram` are not safe under concurrent entry points.
class HybridColorLensProcessor: HybridColorLensProcessorSpec {
  private let context = CIContext(options: [
    .useSoftwareRenderer: false,
    .cacheIntermediates: false,
    .highQualityDownsample: false,
  ])

  private var lastPaletteProcessTime: TimeInterval = 0
  private var lastRegionProcessTime: TimeInterval = 0
  private let minProcessingInterval: TimeInterval = 0.05

  private var paletteResultCache: [String: String] = [:]
  private var previousPaletteRGB: [String: RGBTriplet] = [:]
  private var previousRegionRGB: RGBTriplet?

  /// Reused for MMCQ input and CI RGB pack output — sequential calls only.
  private var pixelBuffer: [UInt8] = []
  /// CI BGRA8 staging for region crop — sequential calls only.
  private var bgraScratch: [UInt8] = []
  private var histogram: [Int] = []
  private let maxImageSize: CGFloat = 128.0
  private static let defaultQuality = 15
  private static let defaultIgnoreWhite = true
  private static let paletteMaxColors = 6
  private static let regionMaxColors = 2
  private let stabilityThreshold: Int = 900

  var memorySize: Int {
    pixelBuffer.count + bgraScratch.count + histogram.count * MemoryLayout<Int>.size
  }

  override init() {
    super.init()
    paletteResultCache.reserveCapacity(8)
    previousPaletteRGB.reserveCapacity(8)
    let maxSide = Int(maxImageSize)
    pixelBuffer.reserveCapacity(maxSide * maxSide * 3)
    bgraScratch.reserveCapacity(maxSide * maxSide * 4)
    histogram = Array(repeating: 0, count: MMCQ.histogramSize)
  }

  /// RGB interleaved uint8 pixels from vision-camera-resizer (already cover-cropped + upright).
  func extractPalette(
    pixels: ArrayBuffer,
    width: Double,
    height: Double
  ) throws -> ColorLensPaletteResult? {
    let currentTime = CACurrentMediaTime()
    if currentTime - lastPaletteProcessTime < minProcessingInterval {
      return cachedPaletteResult()
    }
    lastPaletteProcessTime = currentTime

    let w = Int(width)
    let h = Int(height)
    let expectedSize = w * h * 3
    guard w > 0, h > 0, pixels.size >= expectedSize else {
      return cachedPaletteResult()
    }

    copyArrayBuffer(pixels, byteCount: expectedSize)

    guard extractPaletteColorsUsingMMCQ() != nil else {
      return cachedPaletteResult()
    }

    return cachedPaletteResult()
  }

  /// Axis-aligned rect in raw CVPixelBuffer pixel coordinates (top-left origin).
  /// Returns owned RGB interleaved bytes (same layout as extractPalette) so the caller can dispose the Frame before MMCQ.
  func copyRegion(
    frame: any HybridFrameSpec,
    left: Double,
    top: Double,
    right: Double,
    bottom: Double
  ) throws -> ColorLensRegionPixels? {
    let currentTime = CACurrentMediaTime()
    if currentTime - lastRegionProcessTime < minProcessingInterval {
      return nil
    }
    lastRegionProcessTime = currentTime

    guard let nativeFrame = frame as? any NativeFrame,
          let sampleBuffer = nativeFrame.sampleBuffer,
          let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      return nil
    }

    let bufferWidth = CVPixelBufferGetWidth(imageBuffer)
    let bufferHeight = CVPixelBufferGetHeight(imageBuffer)
    let ciImage = CIImage(cvPixelBuffer: imageBuffer)

    guard let croppedImage = ColorLensImagePipeline.cropBufferRect(
      on: ciImage,
      left: left,
      top: top,
      right: right,
      bottom: bottom,
      bufferWidth: bufferWidth,
      bufferHeight: bufferHeight
    ) else {
      return nil
    }

    let downsampledImage = ColorLensImagePipeline.downsampleForMMCQ(
      croppedImage,
      maxSide: maxImageSize
    )

    guard let dimensions = renderRegionRGBToPixelBuffer(downsampledImage) else {
      return nil
    }

    let byteCount = dimensions.width * dimensions.height * 3
    let owningPixels = pixelBuffer.withUnsafeBufferPointer { buffer -> ArrayBuffer in
      ArrayBuffer.copy(of: buffer.baseAddress!, size: byteCount)
    }

    return ColorLensRegionPixels(
      pixels: owningPixels,
      width: Double(dimensions.width),
      height: Double(dimensions.height)
    )
  }

  /// RGB interleaved uint8 pixels from `copyRegion` → dominant hex via the same MMCQ path as extractPalette.
  func extractDominantColor(
    pixels: ArrayBuffer,
    width: Double,
    height: Double
  ) throws -> String? {
    let w = Int(width)
    let h = Int(height)
    let expectedSize = w * h * 3
    guard w > 0, h > 0, pixels.size >= expectedSize else {
      return previousRegionRGB.map(formatHex)
    }

    copyArrayBuffer(pixels, byteCount: expectedSize)

    guard let dominantRGB = getDominantRGBFromPixelBuffer() else {
      return previousRegionRGB.map(formatHex)
    }

    return applyRegionTemporalSmoothing(dominantRGB)
  }

  // MARK: - Buffer helpers

  private func copyArrayBuffer(_ buffer: ArrayBuffer, byteCount: Int) {
    if pixelBuffer.count != byteCount {
      pixelBuffer = Array(repeating: 0, count: byteCount)
    }
    pixelBuffer.withUnsafeMutableBufferPointer { dest in
      guard let destBase = dest.baseAddress else { return }
      memcpy(destBase, buffer.data, byteCount)
    }
  }

  /// CI renders BGRA8 into `bgraScratch`; pack to interleaved RGB in `pixelBuffer` for shared MMCQ.
  @discardableResult
  private func renderRegionRGBToPixelBuffer(_ image: CIImage) -> (width: Int, height: Int)? {
    let extent = image.extent
    let width = Int(floor(extent.width))
    let height = Int(floor(extent.height))
    guard width > 0, height > 0 else { return nil }

    let originAligned: CIImage
    if extent.origin.x == 0, extent.origin.y == 0 {
      originAligned = image
    } else {
      originAligned = image.transformed(
        by: CGAffineTransform(translationX: -extent.origin.x, y: -extent.origin.y)
      )
    }

    let pixelCount = width * height
    let bgraByteCount = pixelCount * 4
    if bgraScratch.count != bgraByteCount {
      bgraScratch = Array(repeating: 0, count: bgraByteCount)
    }

    let colorSpace = CGColorSpaceCreateDeviceRGB()
    bgraScratch.withUnsafeMutableBytes { rawBuffer in
      guard let baseAddress = rawBuffer.baseAddress else { return }
      context.render(
        originAligned,
        toBitmap: baseAddress,
        rowBytes: width * 4,
        bounds: CGRect(x: 0, y: 0, width: width, height: height),
        format: .BGRA8,
        colorSpace: colorSpace
      )
    }

    let rgbCount = pixelCount * 3
    if pixelBuffer.count != rgbCount {
      pixelBuffer = Array(repeating: 0, count: rgbCount)
    }

    bgraScratch.withUnsafeBufferPointer { bgra in
      pixelBuffer.withUnsafeMutableBufferPointer { rgb in
        guard let bgraBase = bgra.baseAddress, let rgbBase = rgb.baseAddress else { return }
        var rgbIndex = 0
        for i in stride(from: 0, to: bgraByteCount, by: 4) {
          rgbBase[rgbIndex] = bgraBase[i + 2]
          rgbBase[rgbIndex + 1] = bgraBase[i + 1]
          rgbBase[rgbIndex + 2] = bgraBase[i]
          rgbIndex += 3
        }
      }
    }
    return (width, height)
  }

  // MARK: - Palette MMCQ

  private func cachedPaletteResult() -> ColorLensPaletteResult? {
    guard let primary = paletteResultCache["primary"] ?? previousPaletteRGB["primary"].map(formatHex),
          let secondary = paletteResultCache["secondary"] ?? previousPaletteRGB["secondary"].map(formatHex),
          let tertiary = paletteResultCache["tertiary"] ?? previousPaletteRGB["tertiary"].map(formatHex),
          let quaternary = paletteResultCache["quaternary"] ?? previousPaletteRGB["quaternary"].map(formatHex),
          let quinary = paletteResultCache["quinary"] ?? previousPaletteRGB["quinary"].map(formatHex),
          let senary = paletteResultCache["senary"] ?? previousPaletteRGB["senary"].map(formatHex),
          let background = paletteResultCache["background"] ?? previousPaletteRGB["background"].map(formatHex),
          let detail = paletteResultCache["detail"] ?? previousPaletteRGB["detail"].map(formatHex) else {
      return nil
    }

    return ColorLensPaletteResult(
      primary: primary,
      secondary: secondary,
      tertiary: tertiary,
      quaternary: quaternary,
      quinary: quinary,
      senary: senary,
      background: background,
      detail: detail
    )
  }

  private func getPaletteSwatches(maxColors: Int) -> [ColorLensSwatch]? {
    let colorMap = MMCQ.quantizeOptimizedRGB(
      &pixelBuffer,
      &histogram,
      quality: Self.defaultQuality,
      ignoreWhite: Self.defaultIgnoreWhite,
      maxColors: maxColors
    )
    return colorMap?.makePalette()
  }

  @discardableResult
  private func extractPaletteColorsUsingMMCQ() -> [String: String]? {
    guard let palette = getPaletteSwatches(maxColors: Self.paletteMaxColors) else {
      return nil
    }

    let colorCount = min(palette.count, Self.paletteMaxColors)
    let fallbackRGB = palette.isEmpty
      ? RGBTriplet(r: 0, g: 0, b: 0)
      : rgbFromSwatch(palette[0])

    paletteResultCache.removeAll(keepingCapacity: true)

    let slotRGBs: [RGBTriplet] = (0..<Self.paletteMaxColors).map { index in
      if index < colorCount {
        return rgbFromSwatch(palette[index])
      }
      return fallbackRGB
    }

    let slotKeys = ["primary", "secondary", "tertiary", "quaternary", "quinary", "senary"]
    for (index, key) in slotKeys.enumerated() {
      let smoothed = smoothRGB(slotRGBs[index], previous: previousPaletteRGB[key])
      paletteResultCache[key] = formatHex(smoothed)
      previousPaletteRGB[key] = smoothed
    }

    paletteResultCache["background"] = paletteResultCache["primary"]!
    paletteResultCache["detail"] = paletteResultCache["secondary"]!
    previousPaletteRGB["background"] = previousPaletteRGB["primary"]
    previousPaletteRGB["detail"] = previousPaletteRGB["secondary"]

    return paletteResultCache
  }

  // MARK: - Region MMCQ

  private func getDominantRGBFromPixelBuffer() -> RGBTriplet? {
    guard let palette = getPaletteSwatches(maxColors: Self.regionMaxColors)?.first else {
      return nil
    }
    return rgbFromSwatch(palette)
  }

  private func applyRegionTemporalSmoothing(_ newRGB: RGBTriplet) -> String {
    let smoothed = smoothRGB(newRGB, previous: previousRegionRGB)
    previousRegionRGB = smoothed
    return formatHex(smoothed)
  }

  // MARK: - Color helpers

  private func rgbFromSwatch(_ swatch: ColorLensSwatch) -> RGBTriplet {
    RGBTriplet(r: Int(swatch.r), g: Int(swatch.g), b: Int(swatch.b))
  }

  private func smoothRGB(_ newRGB: RGBTriplet, previous: RGBTriplet?) -> RGBTriplet {
    guard let previous, rgbDistance(newRGB, previous) < stabilityThreshold else {
      return newRGB
    }
    return previous
  }

  private func rgbDistance(_ color1: RGBTriplet, _ color2: RGBTriplet) -> Int {
    let deltaR = color1.r - color2.r
    let deltaG = color1.g - color2.g
    let deltaB = color1.b - color2.b
    return deltaR * deltaR + deltaG * deltaG + deltaB * deltaB
  }

  private func formatHex(_ rgb: RGBTriplet) -> String {
    String(format: "#%02X%02X%02X", rgb.r, rgb.g, rgb.b)
  }
}
