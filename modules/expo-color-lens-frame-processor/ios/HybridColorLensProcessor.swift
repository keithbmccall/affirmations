import AVFoundation
import Foundation
import NitroModules
import VisionCamera

private struct RGBTriplet {
  var r: Int
  var g: Int
  var b: Int
}

/// Nitro singleton — shared `pixelBuffer` and `histogram` are not safe under concurrent entry points.
class HybridColorLensProcessor: HybridColorLensProcessorSpec {
  private var lastPaletteProcessTime: TimeInterval = 0
  private var lastRegionProcessTime: TimeInterval = 0
  private let minProcessingInterval: TimeInterval = 0.05

  private var previousPaletteRGB: [String: RGBTriplet] = [:]
  private var previousRegionRGB: RGBTriplet?

  // Fixed palette slots (avoids Dictionary allocs on the hot path).
  private var cachedPrimary = ""
  private var cachedSecondary = ""
  private var cachedTertiary = ""
  private var cachedQuaternary = ""
  private var cachedQuinary = ""
  private var cachedSenary = ""
  private var hasCachedPalette = false

  /// Reused for MMCQ input from the YUV sampler — sequential calls only.
  private var pixelBuffer: [UInt8] = []
  private var histogram: [Int] = []
  private let maxImageSize: CGFloat = 128.0
  private static let defaultQuality = 15
  private static let defaultIgnoreWhite = true
  private static let paletteMaxColors = 6
  private static let regionMaxColors = 2
  private let stabilityThreshold: Int = 900

  private static let hexLookup: [String] = (0..<256).map { String(format: "%02X", $0) }

  var memorySize: Int {
    pixelBuffer.count + histogram.count * MemoryLayout<Int>.size
  }

  override init() {
    super.init()
    previousPaletteRGB.reserveCapacity(8)
    let maxSide = Int(maxImageSize)
    // Worst case: full maxSide×maxSide grid with quality 1.
    pixelBuffer.reserveCapacity(maxSide * maxSide * 3)
    histogram = Array(repeating: 0, count: MMCQ.histogramSize)
  }

  /// Axis-aligned rect in raw CVPixelBuffer pixel coordinates (top-left origin) → dominant hex.
  func extractRegionColor(
    frame: any HybridFrameSpec,
    left: Double,
    top: Double,
    right: Double,
    bottom: Double
  ) throws -> String? {
    let currentTime = CACurrentMediaTime()
    if currentTime - lastRegionProcessTime < minProcessingInterval {
      return previousRegionRGB.map(formatHex)
    }
    lastRegionProcessTime = currentTime

    guard sampleFrame(
      frame: frame,
      left: left,
      top: top,
      right: right,
      bottom: bottom
    ) else {
      return previousRegionRGB.map(formatHex)
    }

    guard let dominantRGB = getDominantRGBFromPixelBuffer() else {
      return previousRegionRGB.map(formatHex)
    }

    return applyRegionTemporalSmoothing(dominantRGB)
  }

  /// Axis-aligned rect in raw CVPixelBuffer pixel coordinates → 6-slot palette.
  func extractFramePalette(
    frame: any HybridFrameSpec,
    left: Double,
    top: Double,
    right: Double,
    bottom: Double
  ) throws -> ColorLensPaletteResult? {
    let currentTime = CACurrentMediaTime()
    if currentTime - lastPaletteProcessTime < minProcessingInterval {
      return cachedPaletteResult()
    }
    lastPaletteProcessTime = currentTime

    guard sampleFrame(
      frame: frame,
      left: left,
      top: top,
      right: right,
      bottom: bottom
    ) else {
      return cachedPaletteResult()
    }

    guard extractPaletteColorsUsingMMCQ() else {
      return cachedPaletteResult()
    }

    return cachedPaletteResult()
  }

  // MARK: - YUV sample

  @discardableResult
  private func sampleFrame(
    frame: any HybridFrameSpec,
    left: Double,
    top: Double,
    right: Double,
    bottom: Double
  ) -> Bool {
    guard let nativeFrame = frame as? any NativeFrame,
          let sampleBuffer = nativeFrame.sampleBuffer,
          let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      return false
    }

    return ColorLensYUVSampler.sampleRegion(
      pixelBuffer: imageBuffer,
      left: left,
      top: top,
      right: right,
      bottom: bottom,
      maxSide: maxImageSize,
      quality: Self.defaultQuality,
      rgbOut: &pixelBuffer
    ) != nil
  }

  // MARK: - Palette MMCQ

  private func cachedPaletteResult() -> ColorLensPaletteResult? {
    guard hasCachedPalette else {
      guard let primary = previousPaletteRGB["primary"].map(formatHex),
            let secondary = previousPaletteRGB["secondary"].map(formatHex),
            let tertiary = previousPaletteRGB["tertiary"].map(formatHex),
            let quaternary = previousPaletteRGB["quaternary"].map(formatHex),
            let quinary = previousPaletteRGB["quinary"].map(formatHex),
            let senary = previousPaletteRGB["senary"].map(formatHex) else {
        return nil
      }
      return ColorLensPaletteResult(
        primary: primary,
        secondary: secondary,
        tertiary: tertiary,
        quaternary: quaternary,
        quinary: quinary,
        senary: senary,
        background: primary,
        detail: secondary
      )
    }

    return ColorLensPaletteResult(
      primary: cachedPrimary,
      secondary: cachedSecondary,
      tertiary: cachedTertiary,
      quaternary: cachedQuaternary,
      quinary: cachedQuinary,
      senary: cachedSenary,
      background: cachedPrimary,
      detail: cachedSecondary
    )
  }

  private func getPaletteSwatches(maxColors: Int) -> [ColorLensSwatch]? {
    let colorMap = pixelBuffer.withUnsafeBufferPointer { pixels in
      MMCQ.quantizeOptimizedRGB(
        pixels,
        &histogram,
        quality: 1,
        ignoreWhite: Self.defaultIgnoreWhite,
        maxColors: maxColors
      )
    }
    return colorMap?.makePalette()
  }

  @discardableResult
  private func extractPaletteColorsUsingMMCQ() -> Bool {
    guard let palette = getPaletteSwatches(maxColors: Self.paletteMaxColors) else {
      return false
    }

    let colorCount = min(palette.count, Self.paletteMaxColors)
    let fallbackRGB = palette.isEmpty
      ? RGBTriplet(r: 0, g: 0, b: 0)
      : rgbFromSwatch(palette[0])

    let slotRGBs: [RGBTriplet] = (0..<Self.paletteMaxColors).map { index in
      if index < colorCount {
        return rgbFromSwatch(palette[index])
      }
      return fallbackRGB
    }

    let slotKeys = ["primary", "secondary", "tertiary", "quaternary", "quinary", "senary"]
    var hexes: [String] = []
    hexes.reserveCapacity(Self.paletteMaxColors)
    for (index, key) in slotKeys.enumerated() {
      let smoothed = smoothRGB(slotRGBs[index], previous: previousPaletteRGB[key])
      let hex = formatHex(smoothed)
      hexes.append(hex)
      previousPaletteRGB[key] = smoothed
    }

    cachedPrimary = hexes[0]
    cachedSecondary = hexes[1]
    cachedTertiary = hexes[2]
    cachedQuaternary = hexes[3]
    cachedQuinary = hexes[4]
    cachedSenary = hexes[5]
    hasCachedPalette = true

    previousPaletteRGB["background"] = previousPaletteRGB["primary"]
    previousPaletteRGB["detail"] = previousPaletteRGB["secondary"]

    return true
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
    let r = min(max(rgb.r, 0), 255)
    let g = min(max(rgb.g, 0), 255)
    let b = min(max(rgb.b, 0), 255)
    return "#" + Self.hexLookup[r] + Self.hexLookup[g] + Self.hexLookup[b]
  }
}
