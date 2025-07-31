import VisionCamera
import UIKit
import CoreImage
import AVFoundation
import UIImageColors


@objc(ColorLensFrameProcessorPlugin)
public class ColorLensFrameProcessorPlugin: FrameProcessorPlugin {
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
  }

  private static let context = CIContext(options: nil)
  


  private static func convertQuality(quality: String) -> UIImageColorsQuality {
    switch (quality) {
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

  @objc
  public static func callback(_ frame: Frame!, withArgs args: [Any]!) -> Any! {
    guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
      print("Failed to get CVPixelBuffer!")
      return nil
    }
    let ciImage = CIImage(cvPixelBuffer: imageBuffer)

    guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else {
      print("Failed to create CGImage!")
      return nil
    }
    let image = UIImage(cgImage: cgImage)
    
    var quality: UIImageColorsQuality = .highest
    
    if !args.isEmpty {
      if let qualityString = args[0] as? NSString {
        quality = convertQuality(quality: qualityString as String)
      }
    }
    
    guard let colors = image.getColors(quality: quality) else {
      print("Failed to get Image Color Palette!")
      return nil
    }
    
    return [
      "primary": colors.primary,
      "secondary": colors.secondary,
      "background": colors.background,
      "detail": colors.detail
    ]
  }
}