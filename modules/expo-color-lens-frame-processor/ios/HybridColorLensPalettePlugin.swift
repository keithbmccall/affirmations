import AVFoundation
import CoreImage
import Foundation
import NitroModules
import UIKit
import VisionCamera

class HybridColorLensPalettePlugin: HybridColorLensPalettePluginSpec {
  private static let context = CIContext(options: [
    .useSoftwareRenderer: false,
    .cacheIntermediates: false,
    .highQualityDownsample: false,
  ])

  private var lastProcessTime: TimeInterval = 0
  private let minProcessingInterval: TimeInterval = 0.05
  private var resultCache: [String: String] = [:]
  private var previousColors: [String: String] = [:]
  private var pixelBuffer: [UInt8] = []
  private var histogram: [Int] = []
  private let maxImageSize: CGFloat = 128.0
  private static let defaultQuality = 15
  private static let defaultIgnoreWhite = true
  private static let maxColors = 6

  override init() {
    super.init()
    resultCache.reserveCapacity(8)
    previousColors.reserveCapacity(8)
    let maxPixels = Int(maxImageSize * maxImageSize * 4)
    pixelBuffer.reserveCapacity(maxPixels)
    histogram = Array(repeating: 0, count: MMCQ.histogramSize)
  }

  func call(
    frame: any HybridFrameSpec,
    viewportWidth: Double,
    viewportHeight: Double
  ) throws -> ColorLensPaletteResult? {
    let currentTime = CACurrentMediaTime()
    if currentTime - lastProcessTime < minProcessingInterval {
      return cachedResult()
    }
    lastProcessTime = currentTime

    guard let previewContext = ColorLensPreviewContext(
      frame: frame,
      viewportWidth: viewportWidth,
      viewportHeight: viewportHeight
    ) else {
      return cachedResult()
    }

    guard let nativeFrame = frame as? any NativeFrame,
          let sampleBuffer = nativeFrame.sampleBuffer,
          let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
      return cachedResult()
    }

    let ciImage = CIImage(cvPixelBuffer: imageBuffer)
    guard let previewAlignedImage = ColorLensImagePipeline.makePreviewAlignedImage(
      from: ciImage,
      context: previewContext
    ) else {
      return cachedResult()
    }

    let downsampledImage = ColorLensImagePipeline.downsampleForMMCQ(
      previewAlignedImage,
      maxSide: maxImageSize
    )

    guard let cgImage = Self.context.createCGImage(downsampledImage, from: downsampledImage.extent) else {
      return cachedResult()
    }

    let image = UIImage(cgImage: cgImage)
    guard extractColorsUsingMMCQ(from: image) != nil else {
      return cachedResult()
    }

    return cachedResult()
  }

  private func cachedResult() -> ColorLensPaletteResult? {
    guard let primary = resultCache["primary"] ?? previousColors["primary"],
          let secondary = resultCache["secondary"] ?? previousColors["secondary"],
          let tertiary = resultCache["tertiary"] ?? previousColors["tertiary"],
          let quaternary = resultCache["quaternary"] ?? previousColors["quaternary"],
          let quinary = resultCache["quinary"] ?? previousColors["quinary"],
          let senary = resultCache["senary"] ?? previousColors["senary"],
          let background = resultCache["background"] ?? previousColors["background"],
          let detail = resultCache["detail"] ?? previousColors["detail"] else {
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

  private func getPalette(from image: UIImage) -> [ColorLensSwatch]? {
    guard makeBytesOptimized(from: image),
          let colorMap = MMCQ.quantizeOptimized(
            &pixelBuffer,
            &histogram,
            quality: Self.defaultQuality,
            ignoreWhite: Self.defaultIgnoreWhite,
            maxColors: Self.maxColors
          ) else {
      return nil
    }
    return colorMap.makePalette()
  }

  @discardableResult
  private func makeBytesOptimized(from image: UIImage) -> Bool {
    guard let cgImage = image.cgImage else { return false }

    let width = cgImage.width
    let height = cgImage.height
    let pixelCount = width * height * 4

    if pixelBuffer.count != pixelCount {
      pixelBuffer = Array(repeating: 0, count: pixelCount)
    } else {
      pixelBuffer.withUnsafeMutableBufferPointer { buffer in
        memset(buffer.baseAddress, 0, pixelCount)
      }
    }

    guard let context = CGContext(
      data: &pixelBuffer,
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: 4 * width,
      space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
    ) else {
      return false
    }

    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    return true
  }

  private func extractColorsUsingMMCQ(from image: UIImage) -> [String: String]? {
    guard let palette = getPalette(from: image) else { return nil }

    let colorCount = min(palette.count, Self.maxColors)
    let fallbackColor = palette.isEmpty
      ? "#000000"
      : String(format: "#%02X%02X%02X", palette[0].r, palette[0].g, palette[0].b)

    resultCache.removeAll(keepingCapacity: true)
    resultCache["primary"] = colorCount > 0
      ? String(format: "#%02X%02X%02X", palette[0].r, palette[0].g, palette[0].b)
      : fallbackColor
    resultCache["secondary"] = colorCount > 1
      ? String(format: "#%02X%02X%02X", palette[1].r, palette[1].g, palette[1].b)
      : fallbackColor
    resultCache["tertiary"] = colorCount > 2
      ? String(format: "#%02X%02X%02X", palette[2].r, palette[2].g, palette[2].b)
      : fallbackColor
    resultCache["quaternary"] = colorCount > 3
      ? String(format: "#%02X%02X%02X", palette[3].r, palette[3].g, palette[3].b)
      : fallbackColor
    resultCache["quinary"] = colorCount > 4
      ? String(format: "#%02X%02X%02X", palette[4].r, palette[4].g, palette[4].b)
      : fallbackColor
    resultCache["senary"] = colorCount > 5
      ? String(format: "#%02X%02X%02X", palette[5].r, palette[5].g, palette[5].b)
      : fallbackColor
    resultCache["background"] = resultCache["primary"]!
    resultCache["detail"] = resultCache["secondary"]!

    return applyTemporalSmoothingOptimized()
  }

  private func applyTemporalSmoothingOptimized() -> [String: String] {
    for (key, newColor) in resultCache {
      if let previousColor = previousColors[key],
         fastColorDistance(newColor, previousColor) < 900 {
        resultCache[key] = previousColor
      }
    }
    previousColors = resultCache
    return resultCache
  }

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
