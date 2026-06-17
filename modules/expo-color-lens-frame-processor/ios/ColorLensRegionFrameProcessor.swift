import VisionCamera
import UIKit
import CoreImage
import AVFoundation

@objc(ColorLensRegionFrameProcessorPlugin)
public class ColorLensRegionFrameProcessorPlugin: FrameProcessorPlugin {

  private static let context = CIContext(options: [
    .useSoftwareRenderer: false,
    .cacheIntermediates: false,
    .highQualityDownsample: false,
  ])

  private var lastProcessTime: TimeInterval = 0
  private let minProcessingInterval: TimeInterval = 0.05

  private var pixelBuffer: [UInt8] = []
  private var histogram: [Int] = []

  private let maxImageSize: CGFloat = 128.0

  private static let defaultQuality = 15
  private static let defaultIgnoreWhite = true
  private static let maxColors = 2

  private var previousColor: String?
  private let stabilityThreshold: Int = 900

  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)

    let maxPixels = Int(maxImageSize * maxImageSize * 4)
    pixelBuffer.reserveCapacity(maxPixels)
    histogram = Array(repeating: 0, count: MMCQ.histogramSize)
  }

  private func cropToRegion(
    _ ciImage: CIImage,
    centerX: CGFloat,
    centerY: CGFloat,
    radius: CGFloat
  ) -> CIImage {
    let extent = ciImage.extent
    let shortSide = min(extent.width, extent.height)
    let radiusPx = radius * shortSide
    let cropRect = CGRect(
      x: centerX * extent.width - radiusPx,
      y: centerY * extent.height - radiusPx,
      width: radiusPx * 2,
      height: radiusPx * 2
    ).intersection(extent)

    guard !cropRect.isNull, cropRect.width > 0, cropRect.height > 0 else {
      return ciImage
    }

    return ciImage.cropped(to: cropRect)
  }

  private func downsampleImage(_ ciImage: CIImage) -> CIImage {
    let extent = ciImage.extent
    let width = extent.width
    let height = extent.height

    if width <= maxImageSize && height <= maxImageSize {
      return ciImage
    }

    let scale = min(maxImageSize / width, maxImageSize / height)
    let transform = CGAffineTransform(scaleX: scale, y: scale)
    return ciImage.transformed(by: transform)
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

  private func getDominantColor(from image: UIImage) -> String? {
    guard makeBytesOptimized(from: image),
          let colorMap = MMCQ.quantizeOptimized(
            &pixelBuffer,
            &histogram,
            quality: Self.defaultQuality,
            ignoreWhite: Self.defaultIgnoreWhite,
            maxColors: Self.maxColors
          ),
          let palette = colorMap.makePalette().first else {
      return nil
    }

    return String(format: "#%02X%02X%02X", palette.r, palette.g, palette.b)
  }

  private func applyTemporalSmoothing(_ newColor: String) -> String {
    if let previousColor,
       fastColorDistance(newColor, previousColor) < stabilityThreshold {
      return previousColor
    }

    previousColor = newColor
    return newColor
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

  private func normalizedCGFloat(from value: Any?) -> CGFloat? {
    if let number = value as? NSNumber {
      return CGFloat(number.doubleValue)
    }
    if let doubleValue = value as? Double {
      return CGFloat(doubleValue)
    }
    if let floatValue = value as? Float {
      return CGFloat(floatValue)
    }
    if let intValue = value as? Int {
      return CGFloat(intValue)
    }
    return nil
  }

  @objc
  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
    guard let centerX = normalizedCGFloat(from: arguments?["centerX"]),
          let centerY = normalizedCGFloat(from: arguments?["centerY"]),
          let radius = normalizedCGFloat(from: arguments?["radius"]) else {
      return nil
    }

    let currentTime = CACurrentMediaTime()
    if currentTime - lastProcessTime < minProcessingInterval {
      return previousColor
    }
    lastProcessTime = currentTime

    guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
      return previousColor
    }

    let ciImage = CIImage(cvPixelBuffer: imageBuffer)
    let croppedImage = cropToRegion(ciImage, centerX: centerX, centerY: centerY, radius: radius)
    let downsampledImage = downsampleImage(croppedImage)

    guard let cgImage = Self.context.createCGImage(downsampledImage, from: downsampledImage.extent) else {
      return previousColor
    }

    let image = UIImage(cgImage: cgImage)

    guard let dominantColor = getDominantColor(from: image) else {
      return previousColor
    }

    return applyTemporalSmoothing(dominantColor)
  }
}
