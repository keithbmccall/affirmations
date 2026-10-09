import AVFoundation
import CoreImage
import Foundation
import NitroModules
import VisionCamera

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
  private var previousPaletteColors: [String: String] = [:]
  private var previousRegionColor: String?

  private var pixelBuffer: [UInt8] = []
  private var histogram: [Int] = []
  private let maxImageSize: CGFloat = 128.0
  private static let defaultQuality = 15
  private static let defaultIgnoreWhite = true
  private static let paletteMaxColors = 6
  private static let regionMaxColors = 2
  private let stabilityThreshold: Int = 900

  var memorySize: Int {
    pixelBuffer.count + histogram.count * MemoryLayout<Int>.size
  }

  override init() {
    super.init()
    paletteResultCache.reserveCapacity(8)
    previousPaletteColors.reserveCapacity(8)
    let maxPixels = Int(maxImageSize * maxImageSize * 4)
    pixelBuffer.reserveCapacity(maxPixels)
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

    guard extractPaletteColorsUsingMMCQ(rgbInterleaved: true) != nil else {
      return cachedPaletteResult()
    }

    return cachedPaletteResult()
  }

  /// Axis-aligned rect in raw CVPixelBuffer pixel coordinates (top-left origin).
  /// Returns owned BGRA bytes so the caller can dispose the camera Frame before MMCQ.
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

    guard let dimensions = renderBGRAToPixelBuffer(downsampledImage) else {
      return nil
    }

    let byteCount = dimensions.width * dimensions.height * 4
    let owningPixels = pixelBuffer.withUnsafeBufferPointer { buffer -> ArrayBuffer in
      ArrayBuffer.copy(of: buffer.baseAddress!, size: byteCount)
    }

    return ColorLensRegionPixels(
      pixels: owningPixels,
      width: Double(dimensions.width),
      height: Double(dimensions.height)
    )
  }

  /// BGRA uint8 interleaved pixels from `copyRegion` → dominant hex with temporal smoothing.
  func extractDominantColor(
    pixels: ArrayBuffer,
    width: Double,
    height: Double
  ) throws -> String? {
    let w = Int(width)
    let h = Int(height)
    let expectedSize = w * h * 4
    guard w > 0, h > 0, pixels.size >= expectedSize else {
      return previousRegionColor
    }

    copyArrayBuffer(pixels, byteCount: expectedSize)

    guard let dominantColor = getDominantColorFromPixelBuffer() else {
      return previousRegionColor
    }

    return applyRegionTemporalSmoothing(dominantColor)
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

  @discardableResult
  private func renderBGRAToPixelBuffer(_ image: CIImage) -> (width: Int, height: Int)? {
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

    let pixelCount = width * height * 4
    if pixelBuffer.count != pixelCount {
      pixelBuffer = Array(repeating: 0, count: pixelCount)
    }

    let colorSpace = CGColorSpaceCreateDeviceRGB()
    pixelBuffer.withUnsafeMutableBytes { rawBuffer in
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
    return (width, height)
  }

  // MARK: - Palette MMCQ

  private func cachedPaletteResult() -> ColorLensPaletteResult? {
    guard let primary = paletteResultCache["primary"] ?? previousPaletteColors["primary"],
          let secondary = paletteResultCache["secondary"] ?? previousPaletteColors["secondary"],
          let tertiary = paletteResultCache["tertiary"] ?? previousPaletteColors["tertiary"],
          let quaternary = paletteResultCache["quaternary"] ?? previousPaletteColors["quaternary"],
          let quinary = paletteResultCache["quinary"] ?? previousPaletteColors["quinary"],
          let senary = paletteResultCache["senary"] ?? previousPaletteColors["senary"],
          let background = paletteResultCache["background"] ?? previousPaletteColors["background"],
          let detail = paletteResultCache["detail"] ?? previousPaletteColors["detail"] else {
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

  private func getPaletteSwatches(maxColors: Int, rgbInterleaved: Bool) -> [ColorLensSwatch]? {
    let colorMap: MMCQ.ColorMap?
    if rgbInterleaved {
      colorMap = MMCQ.quantizeOptimizedRGB(
        &pixelBuffer,
        &histogram,
        quality: Self.defaultQuality,
        ignoreWhite: Self.defaultIgnoreWhite,
        maxColors: maxColors
      )
    } else {
      colorMap = MMCQ.quantizeOptimized(
        &pixelBuffer,
        &histogram,
        quality: Self.defaultQuality,
        ignoreWhite: Self.defaultIgnoreWhite,
        maxColors: maxColors
      )
    }
    return colorMap?.makePalette()
  }

  @discardableResult
  private func extractPaletteColorsUsingMMCQ(rgbInterleaved: Bool) -> [String: String]? {
    guard let palette = getPaletteSwatches(
      maxColors: Self.paletteMaxColors,
      rgbInterleaved: rgbInterleaved
    ) else {
      return nil
    }

    let colorCount = min(palette.count, Self.paletteMaxColors)
    let fallbackColor = palette.isEmpty
      ? "#000000"
      : String(format: "#%02X%02X%02X", palette[0].r, palette[0].g, palette[0].b)

    paletteResultCache.removeAll(keepingCapacity: true)
    paletteResultCache["primary"] = colorCount > 0
      ? String(format: "#%02X%02X%02X", palette[0].r, palette[0].g, palette[0].b)
      : fallbackColor
    paletteResultCache["secondary"] = colorCount > 1
      ? String(format: "#%02X%02X%02X", palette[1].r, palette[1].g, palette[1].b)
      : fallbackColor
    paletteResultCache["tertiary"] = colorCount > 2
      ? String(format: "#%02X%02X%02X", palette[2].r, palette[2].g, palette[2].b)
      : fallbackColor
    paletteResultCache["quaternary"] = colorCount > 3
      ? String(format: "#%02X%02X%02X", palette[3].r, palette[3].g, palette[3].b)
      : fallbackColor
    paletteResultCache["quinary"] = colorCount > 4
      ? String(format: "#%02X%02X%02X", palette[4].r, palette[4].g, palette[4].b)
      : fallbackColor
    paletteResultCache["senary"] = colorCount > 5
      ? String(format: "#%02X%02X%02X", palette[5].r, palette[5].g, palette[5].b)
      : fallbackColor
    paletteResultCache["background"] = paletteResultCache["primary"]!
    paletteResultCache["detail"] = paletteResultCache["secondary"]!

    return applyPaletteTemporalSmoothing()
  }

  private func applyPaletteTemporalSmoothing() -> [String: String] {
    for (key, newColor) in paletteResultCache {
      if let previousColor = previousPaletteColors[key],
         fastColorDistance(newColor, previousColor) < stabilityThreshold {
        paletteResultCache[key] = previousColor
      }
    }
    previousPaletteColors = paletteResultCache
    return paletteResultCache
  }

  // MARK: - Region MMCQ

  private func getDominantColorFromPixelBuffer() -> String? {
    guard let palette = getPaletteSwatches(
      maxColors: Self.regionMaxColors,
      rgbInterleaved: false
    )?.first else {
      return nil
    }
    return String(format: "#%02X%02X%02X", palette.r, palette.g, palette.b)
  }

  private func applyRegionTemporalSmoothing(_ newColor: String) -> String {
    if let previousRegionColor,
       fastColorDistance(newColor, previousRegionColor) < stabilityThreshold {
      return previousRegionColor
    }
    previousRegionColor = newColor
    return newColor
  }

  // MARK: - Color helpers

  private func fastColorDistance(_ color1: String, _ color2: String) -> Int {
    guard let rgb1 = hexToRGBFast(color1), let rgb2 = hexToRGBFast(color2) else { return 0 }
    let deltaR = rgb1.r - rgb2.r
    let deltaG = rgb1.g - rgb2.g
    let deltaB = rgb1.b - rgb2.b
    return deltaR * deltaR + deltaG * deltaG + deltaB * deltaB
  }

  private func hexToRGBFast(_ hex: String) -> (r: Int, g: Int, b: Int)? {
    guard hex.count == 7, hex.first == "#" else { return nil }
    let scanner = Scanner(string: String(hex.dropFirst()))
    var hexNumber: UInt64 = 0
    if scanner.scanHexInt64(&hexNumber) {
      return (
        r: Int((hexNumber & 0xFF0000) >> 16),
        g: Int((hexNumber & 0x00FF00) >> 8),
        b: Int(hexNumber & 0x0000FF)
      )
    }
    return nil
  }
}
