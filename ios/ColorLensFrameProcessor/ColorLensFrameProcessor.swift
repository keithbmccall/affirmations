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
    let components = color.cgColor.components
    let r: CGFloat = components?[0] ?? 0.0
    let g: CGFloat = components?[1] ?? 0.0
    let b: CGFloat = components?[2] ?? 0.0
    
    return String(format: "#%02lX%02lX%02lX", 
                  lroundf(Float(r * 255)), 
                  lroundf(Float(g * 255)), 
                  lroundf(Float(b * 255)))
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
    
    // Determine quality setting from arguments
    var quality: UIImageColorsQuality = .high // Default to high for good balance
    
    if let args = arguments, let qualityString = args["quality"] as? String {
      quality = Self.convertQuality(quality: qualityString)
    }
    
    // Extract colors using UIImageColors
    guard let colors = image.getColors(quality: quality) else {
      print("ColorLensFrameProcessor: Failed to extract colors from image")
      return nil
    }
    
    // Convert colors to hex strings and create result dictionary
    let result: [String: String] = [
      "primary": Self.colorToHex(colors.primary),
      "secondary": Self.colorToHex(colors.secondary),
      "background": Self.colorToHex(colors.background),
      "detail": Self.colorToHex(colors.detail)
    ]
    
    return result
  }
}

