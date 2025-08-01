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
    // Pre-allocate result dictionary for 8 colors
    resultCache.reserveCapacity(8)
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
    
    // Create a context to analyze the entire image
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let bitmapInfo = CGImageAlphaInfo.premultipliedLast.rawValue | CGBitmapInfo.byteOrder32Big.rawValue
    
    guard let context = CGContext(data: nil,
                                 width: width,
                                 height: height,
                                 bitsPerComponent: 8,
                                 bytesPerRow: width * 4,
                                 space: colorSpace,
                                 bitmapInfo: bitmapInfo) else {
      return nil
    }
    
    // Draw the entire image
    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    
    guard let data = context.data else {
      return nil
    }
    
    let ptr = data.bindMemory(to: UInt8.self, capacity: width * height * 4)
    
    // Color frequency analysis
    var colorCounts: [String: Int] = [:]
    let sampleStep = max(1, min(width, height) / 32) // Sample every Nth pixel for performance
    
    // Sample pixels across the image
    for y in stride(from: 0, to: height, by: sampleStep) {
      for x in stride(from: 0, to: width, by: sampleStep) {
        let index = (y * width + x) * 4
        let r = Int(ptr[index])
        let g = Int(ptr[index + 1])
        let b = Int(ptr[index + 2])
        
        // Quantize colors to reduce noise (group similar colors)
        let quantizedR = (r / 16) * 16
        let quantizedG = (g / 16) * 16
        let quantizedB = (b / 16) * 16
        
        let colorKey = String(format: "#%02X%02X%02X", quantizedR, quantizedG, quantizedB)
        colorCounts[colorKey, default: 0] += 1
      }
    }
    
    // Sort colors by frequency
    let sortedColors = colorCounts.sorted { $0.value > $1.value }
    
    // Extract top 6 dominant colors
    let dominantColors = Array(sortedColors.prefix(6)).map { $0.key }
    
    // Fill in missing colors with the most dominant color
    let defaultColor = dominantColors.first ?? "#000000"
    let colors = dominantColors + Array(repeating: defaultColor, count: max(0, 6 - dominantColors.count))
    
    // Background is usually the most frequent color
    let background = dominantColors.first ?? "#000000"
    
    // Detail is often a muted version of the background or a subtle accent
    let detail = dominantColors.count > 1 ? dominantColors[1] : background
    
    return [
      "primary": colors[0],
      "secondary": colors[1],
      "tertiary": colors[2],
      "quaternary": colors[3],
      "quinary": colors[4],
      "senary": colors[5],
      "background": background,
      "detail": detail
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

