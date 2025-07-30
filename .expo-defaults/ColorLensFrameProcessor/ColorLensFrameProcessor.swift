import VisionCamera
import UIKit
import CoreImage
import AVFoundation


@objc(ColorLensFrameProcessorPlugin)
public class ColorLensFrameProcessorPlugin: FrameProcessorPlugin {
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable: Any]?) -> Any? {
    let buffer = frame.buffer
    let orientation = frame.orientation
    
    guard let pixelBuffer = CMSampleBufferGetImageBuffer(buffer) else {
      return ["error": "Could not get pixel buffer from sample buffer"]
    }
    
    let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
    let context = CIContext()
    
    guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else {
      return ["error": "Could not create CGImage"]
    }
    
    let uiImage = UIImage(cgImage: cgImage)
    return extractColorPalette(from: uiImage)
  }
  
  private func extractColorPalette(from image: UIImage) -> [String: Any] {
    // Resize image for better performance
    let resizedImage = resizeImage(image, to: CGSize(width: 100, height: 100))
    
    // Extract colors using iOS native approach
    let colors = extractColorsFromImage(resizedImage, count: 8)
    
    return [
      "colors": colors,
      "primaryColor": colors.first ?? "#000000",
      "colorCount": colors.count
    ]
  }
  
  private func resizeImage(_ image: UIImage, to size: CGSize) -> UIImage {
    UIGraphicsBeginImageContextWithOptions(size, false, 0.0)
    image.draw(in: CGRect(origin: .zero, size: size))
    let resizedImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    return resizedImage ?? image
  }
  
  private func extractColorsFromImage(_ image: UIImage, count: Int) -> [String] {
    guard let cgImage = image.cgImage else { return [] }
    
    let width = cgImage.width
    let height = cgImage.height
    let bytesPerPixel = 4
    let bytesPerRow = width * bytesPerPixel
    
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let context = CGContext(data: nil,
                              width: width,
                              height: height,
                              bitsPerComponent: 8,
                              bytesPerRow: bytesPerRow,
                              space: colorSpace,
                              bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
      return []
    }
    
    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    
    guard let data = context.data else { return [] }
    
    let buffer = data.bindMemory(to: UInt8.self, capacity: width * height * bytesPerPixel)
    var colorCounts: [String: Int] = [:]
    
    // Sample every pixel for small resized image
    for y in 0..<height {
      for x in 0..<width {
        let pixelIndex = (y * width + x) * bytesPerPixel
        let r = buffer[pixelIndex]
        let g = buffer[pixelIndex + 1]
        let b = buffer[pixelIndex + 2]
        
        // Skip very dark or very light pixels
        let brightness = (Int(r) + Int(g) + Int(b)) / 3
        if brightness < 30 || brightness > 225 { continue }
        
        // Quantize colors to reduce noise
        let quantizedR = (r / 32) * 32
        let quantizedG = (g / 32) * 32
        let quantizedB = (b / 32) * 32
        
        let colorKey = String(format: "#%02X%02X%02X", quantizedR, quantizedG, quantizedB)
        colorCounts[colorKey, default: 0] += 1
      }
    }
    
    let sortedColors = colorCounts.sorted { $0.value > $1.value }
    return Array(sortedColors.prefix(count).map { $0.key })
  }
}