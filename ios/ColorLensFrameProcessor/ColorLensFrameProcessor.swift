import VisionCamera
import UIKit
import CoreImage
import AVFoundation
import UIImageColors

@objc(ColorLensFrameProcessorPlugin)
public class ColorLensFrameProcessorPlugin: FrameProcessorPlugin {
  
  // Shared CIContext for better performance
  private static let context = CIContext(options: [.useSoftwareRenderer: false])
  
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }
  
  private static func convertQuality(quality: String) -> UIImageColorsQuality {
    switch quality.lowercased() {
    case "lowest":
      return .lowest
    case "low":
      return .low
    case "high":
      return .high
    case "highest":
      fallthrough
    default:
      return .highest
    }
  }
  
  private static func colorToHex(_ color: UIColor) -> String {
    // Use getRed method to properly convert from any color space to RGB
    var red: CGFloat = 0
    var green: CGFloat = 0
    var blue: CGFloat = 0
    var alpha: CGFloat = 0
    
    // This method automatically converts from any color space to RGB
    guard color.getRed(&red, green: &green, blue: &blue, alpha: &alpha) else {
      // Fallback: try to get components directly (for grayscale or other spaces)
      guard let components = color.cgColor.components else {
        return "#000000"
      }
      
      let numberOfComponents = color.cgColor.numberOfComponents
      
      if numberOfComponents == 1 {
        // Grayscale
        let gray = components[0]
        return String(format: "#%02lX%02lX%02lX", 
                      lroundf(Float(gray * 255)), 
                      lroundf(Float(gray * 255)), 
                      lroundf(Float(gray * 255)))
      } else if numberOfComponents >= 3 {
        // RGB or RGBA
        let r: CGFloat = components[0]
        let g: CGFloat = components[1]
        let b: CGFloat = components[2]
        return String(format: "#%02lX%02lX%02lX", 
                      lroundf(Float(r * 255)), 
                      lroundf(Float(g * 255)), 
                      lroundf(Float(b * 255)))
      } else {
        return "#000000"
      }
    }
    
    // Debug: Print RGB values
    print("ColorLensFrameProcessor: RGB values - R: \(red), G: \(green), B: \(blue)")
    
    // getRed already returns values in 0-1 range, no need for additional clamping
    return String(format: "#%02lX%02lX%02lX", 
                  lroundf(Float(red * 255)), 
                  lroundf(Float(green * 255)), 
                  lroundf(Float(blue * 255)))
  }
  
  // Alternative color extraction method for debugging
  private static func extractColorsManually(from image: UIImage) -> [String: String] {
    // Create a 1x1 pixel context to sample the center color
    let size = CGSize(width: 1, height: 1)
    UIGraphicsBeginImageContextWithOptions(size, false, 0.0)
    image.draw(in: CGRect(origin: .zero, size: size))
    let pixelImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    
    guard let pixelData = pixelImage?.cgImage?.dataProvider?.data,
          let data = CFDataGetBytePtr(pixelData) else {
      return [
        "primary": "#000000",
        "secondary": "#FFFFFF",
        "background": "#808080",
        "detail": "#404040"
      ]
    }
    
    // Debug: Print raw byte values
    print("ColorLensFrameProcessor: Raw bytes - [0]: \(data[0]), [1]: \(data[1]), [2]: \(data[2]), [3]: \(data[3])")
    
    // Try different byte orders to see which one works
    let r1 = Int(data[0])
    let g1 = Int(data[1])
    let b1 = Int(data[2])
    
    let r2 = Int(data[2])
    let g2 = Int(data[1])
    let b2 = Int(data[0])
    
    let centerColor1 = String(format: "#%02X%02X%02X", r1, g1, b1)
    let centerColor2 = String(format: "#%02X%02X%02X", r2, g2, b2)
    
    print("ColorLensFrameProcessor: RGB order 1 (R,G,B): \(centerColor1)")
    print("ColorLensFrameProcessor: RGB order 2 (B,G,R): \(centerColor2)")
    
    // Use the BGR order (swapped red and blue) as this is common in some image formats
    let centerColor = centerColor2
    
    return [
      "primary": centerColor,
      "secondary": centerColor,
      "background": centerColor,
      "detail": centerColor
    ]
  }
  
  // More reliable color extraction using Core Image
  private static func extractColorsWithCoreImage(from image: UIImage) -> [String: String] {
    guard let cgImage = image.cgImage else {
      return [
        "primary": "#000000",
        "secondary": "#FFFFFF",
        "background": "#808080",
        "detail": "#404040"
      ]
    }
    
    let width = cgImage.width
    let height = cgImage.height
    let centerX = width / 2
    let centerY = height / 2
    
    // Create a 1x1 pixel context at the center
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let bitmapInfo = CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue
    
    guard let context = CGContext(data: nil,
                                 width: 1,
                                 height: 1,
                                 bitsPerComponent: 8,
                                 bytesPerRow: 4,
                                 space: colorSpace,
                                 bitmapInfo: bitmapInfo) else {
      return [
        "primary": "#000000",
        "secondary": "#FFFFFF",
        "background": "#808080",
        "detail": "#404040"
      ]
    }
    
    // Draw the center pixel
    context.draw(cgImage, in: CGRect(x: -centerX, y: -centerY, width: width, height: height))
    
    guard let data = context.data else {
      return [
        "primary": "#000000",
        "secondary": "#FFFFFF",
        "background": "#808080",
        "detail": "#404040"
      ]
    }
    
    let ptr = data.bindMemory(to: UInt8.self, capacity: 4)
    let r = Int(ptr[0])
    let g = Int(ptr[1])
    let b = Int(ptr[2])
    
    let centerColor = String(format: "#%02X%02X%02X", r, g, b)
    print("ColorLensFrameProcessor: Core Image center color: \(centerColor)")
    
    return [
      "primary": centerColor,
      "secondary": centerColor,
      "background": centerColor,
      "detail": centerColor
    ]
  }
  
  @objc
  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any? {
    // Extract image buffer from frame
    guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
      print("ColorLensFrameProcessor: Failed to get CVPixelBuffer from frame")
      return nil
    }
    
    // Create CIImage from buffer
    let ciImage = CIImage(cvPixelBuffer: imageBuffer)
    
    // Convert to CGImage for UIImageColors processing
    guard let cgImage = Self.context.createCGImage(ciImage, from: ciImage.extent) else {
      print("ColorLensFrameProcessor: Failed to create CGImage from CIImage")
      return nil
    }
    
    // Create UIImage for color extraction
    let image = UIImage(cgImage: cgImage)
    
    // Use Core Image extraction for more reliable color values
    let result = Self.extractColorsWithCoreImage(from: image)
    
    // Debug: Print final hex values
    print("ColorLensFrameProcessor: Hex colors - Primary: \(result["primary"] ?? "nil"), Secondary: \(result["secondary"] ?? "nil"), Background: \(result["background"] ?? "nil"), Detail: \(result["detail"] ?? "nil")")
    
    return result
  }
}

