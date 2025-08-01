import VisionCamera
import UIKit
import CoreImage
import AVFoundation

@objc(ColorLensFrameProcessorPlugin)
public class ColorLensFrameProcessorPlugin: FrameProcessorPlugin {
  
  // Shared CIContext for better performance - reuse across all instances
  private static let context = CIContext(options: [
    .useSoftwareRenderer: false,
    .cacheIntermediates: false, // Disable caching for real-time processing
    .highQualityDownsample: false // Disable for performance
  ])
  
  // Reusable color components to avoid allocations
  private var redComponent: CGFloat = 0
  private var greenComponent: CGFloat = 0
  private var blueComponent: CGFloat = 0
  private var alphaComponent: CGFloat = 0
  
  // Frame rate limiting to prevent excessive processing
  private var lastProcessTime: TimeInterval = 0
  private let minProcessingInterval: TimeInterval = 0.1 // 10 FPS max
  
  // Pre-allocated result dictionary to reuse
  private var resultCache: [String: String] = [:]
  
  // Maximum image size for processing (performance optimization)
  private let maxImageSize: CGFloat = 256.0
  
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
    // Pre-allocate result dictionary
    resultCache.reserveCapacity(4)
  }
  
  // Ultra-fast hex conversion without String formatting
  private func colorToHexOptimized(_ color: UIColor) -> String {
    // Get RGB components, converting from any color space if necessary
    guard color.getRed(&redComponent, green: &greenComponent, blue: &blueComponent, alpha: &alphaComponent) else {
      // Fallback: try to get components directly (for grayscale or other spaces)
      guard let components = color.cgColor.components else {
        return "#000000"
      }
      
      let numberOfComponents = color.cgColor.numberOfComponents
      
      if numberOfComponents == 1 {
        // Grayscale
        let gray = components[0]
        let grayInt = Int(gray * 255)
        return String(format: "#%02X%02X%02X", grayInt, grayInt, grayInt)
      } else if numberOfComponents >= 3 {
        // RGB or RGBA
        let r = Int(components[0] * 255)
        let g = Int(components[1] * 255)
        let b = Int(components[2] * 255)
        return String(format: "#%02X%02X%02X", r, g, b)
      } else {
        return "#000000"
      }
    }
    
    // Convert to integers once
    let r = Int(redComponent * 255)
    let g = Int(greenComponent * 255)
    let b = Int(blueComponent * 255)
    
    // Use faster String format with Int instead of Float
    return String(format: "#%02X%02X%02X", r, g, b)
  }
  
  // Optimized color extraction using Core Image
  private func extractColorsOptimized(from image: UIImage) -> [String: String]? {
    guard let cgImage = image.cgImage else {
      return nil
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
      return nil
    }
    
    // Draw the center pixel
    context.draw(cgImage, in: CGRect(x: -centerX, y: -centerY, width: width, height: height))
    
    guard let data = context.data else {
      return nil
    }
    
    let ptr = data.bindMemory(to: UInt8.self, capacity: 4)
    let r = Int(ptr[0])
    let g = Int(ptr[1])
    let b = Int(ptr[2])
    
    let centerColor = String(format: "#%02X%02X%02X", r, g, b)
    
    return [
      "primary": centerColor,
      "secondary": centerColor,
      "background": centerColor,
      "detail": centerColor
    ]
  }
  
  // Downsample image for better performance
  private func downsampleImage(_ ciImage: CIImage) -> CIImage {
    let extent = ciImage.extent
    let width = extent.width
    let height = extent.height
    
    // Only downsample if image is larger than max size
    if width <= maxImageSize && height <= maxImageSize {
      return ciImage
    }
    
    // Calculate scale factor
    let scale = min(maxImageSize / width, maxImageSize / height)
    
    // Create transform for downsampling
    let transform = CGAffineTransform(scaleX: scale, y: scale)
    return ciImage.transformed(by: transform)
  }
  
  @objc
  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any? {
    // Frame rate limiting to prevent excessive processing
    let currentTime = CACurrentMediaTime()
    if currentTime - lastProcessTime < minProcessingInterval {
      return nil // Skip this frame
    }
    lastProcessTime = currentTime
    
    // Extract image buffer from frame
    guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
      return nil
    }
    
    // Create CIImage from buffer - this is lightweight
    let ciImage = CIImage(cvPixelBuffer: imageBuffer)
    
    // Downsample image for better performance
    let downsampledImage = downsampleImage(ciImage)
    
    // Convert to CGImage for processing
    guard let cgImage = Self.context.createCGImage(downsampledImage, from: downsampledImage.extent) else {
      return nil
    }
    
    // Create UIImage for color extraction
    let image = UIImage(cgImage: cgImage)
    
    // Extract colors using optimized method
    guard let colors = extractColorsOptimized(from: image) else {
      return nil
    }
    
    // Update result cache
    resultCache.removeAll(keepingCapacity: true)
    resultCache = colors
    
    // Return the colors
    return resultCache
  }
  
  // Cleanup method to release resources
  deinit {
    resultCache.removeAll()
  }
}

