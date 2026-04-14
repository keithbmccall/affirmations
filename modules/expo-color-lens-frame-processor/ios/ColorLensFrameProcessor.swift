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
  
  // Performance optimizations
  private var lastProcessTime: TimeInterval = 0
  private let minProcessingInterval: TimeInterval = 0.05 // 20 FPS max for smoother updates
  
  // Pre-allocated data structures for performance
  private var resultCache: [String: String] = [:]
  private var pixelBuffer: [UInt8] = []
  private var histogram: [Int] = []
  
  // Reduced image size for faster processing
  private let maxImageSize: CGFloat = 128.0 // Smaller for better performance
  
  // Optimized MMCQ settings for real-time processing
  public static let defaultQuality = 15 // Increased for faster processing
  public static let defaultIgnoreWhite = true
  private static let maxColors = 6 // Reduced from 8 for faster processing
  
  // Simplified temporal smoothing
  private var previousColors: [String: String] = [:]
  private let stabilityThreshold: Int = 2 // Reduced for faster response
  
  public override init(proxy: VisionCameraProxyHolder, options: [AnyHashable: Any]! = [:]) {
    super.init(proxy: proxy, options: options)
    
    // Pre-allocate with fixed capacities to avoid reallocations
    resultCache.reserveCapacity(8)
    previousColors.reserveCapacity(8)
    
    // Pre-allocate pixel buffer for max image size
    let maxPixels = Int(maxImageSize * maxImageSize * 4)
    pixelBuffer.reserveCapacity(maxPixels)
    
    // Pre-allocate histogram
    histogram = Array(repeating: 0, count: MMCQ.histogramSize)
  }
  
  // Color Thief MMCQ Implementation
  // ================================
  
  /// Optimized color palette extraction using pre-allocated buffers
  private func getPalette(from image: UIImage) -> [Color]? {
    guard makeBytesOptimized(from: image),
          let colorMap = MMCQ.quantizeOptimized(&pixelBuffer, &histogram, quality: Self.defaultQuality, ignoreWhite: Self.defaultIgnoreWhite, maxColors: Self.maxColors) else {
      return nil
    }
    return colorMap.makePalette()
  }
  
  /// Optimized pixel extraction using pre-allocated buffer
  @discardableResult
  private func makeBytesOptimized(from image: UIImage) -> Bool {
    guard let cgImage = image.cgImage else { return false }
    
    let width = cgImage.width
    let height = cgImage.height
    let pixelCount = width * height * 4
    
    // Reuse existing buffer or resize if needed
    if pixelBuffer.count != pixelCount {
      pixelBuffer = Array(repeating: 0, count: pixelCount)
    } else {
      // Clear existing data efficiently
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
      bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue | CGBitmapInfo.byteOrder32Little.rawValue) else {
      return false
    }
    
    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    return true
  }
  
  /// Fast color extraction with minimal allocations
  private func extractColorsUsingMMCQ(from image: UIImage) -> [String: String]? {
    guard let palette = getPalette(from: image) else { return nil }
    
    // Convert directly without intermediate arrays
    let colorCount = min(palette.count, Self.maxColors)
    let fallbackColor = palette.isEmpty ? "#000000" : String(format: "#%02X%02X%02X", palette[0].r, palette[0].g, palette[0].b)
    
    // Clear and reuse result cache
    resultCache.removeAll(keepingCapacity: true)
    
    resultCache["primary"] = colorCount > 0 ? String(format: "#%02X%02X%02X", palette[0].r, palette[0].g, palette[0].b) : fallbackColor
    resultCache["secondary"] = colorCount > 1 ? String(format: "#%02X%02X%02X", palette[1].r, palette[1].g, palette[1].b) : fallbackColor
    resultCache["tertiary"] = colorCount > 2 ? String(format: "#%02X%02X%02X", palette[2].r, palette[2].g, palette[2].b) : fallbackColor
    resultCache["quaternary"] = colorCount > 3 ? String(format: "#%02X%02X%02X", palette[3].r, palette[3].g, palette[3].b) : fallbackColor
    resultCache["quinary"] = colorCount > 4 ? String(format: "#%02X%02X%02X", palette[4].r, palette[4].g, palette[4].b) : fallbackColor
    resultCache["senary"] = colorCount > 5 ? String(format: "#%02X%02X%02X", palette[5].r, palette[5].g, palette[5].b) : fallbackColor
    resultCache["background"] = resultCache["primary"]!
    resultCache["detail"] = resultCache["secondary"]!
    
    return applyTemporalSmoothingOptimized()
  }
  
    /// Optimized temporal smoothing using resultCache directly
  private func applyTemporalSmoothingOptimized() -> [String: String] {
    // Apply simple smoothing - if previous color is similar, use it
    for (key, newColor) in resultCache {
      if let previousColor = previousColors[key],
         fastColorDistance(newColor, previousColor) < 900 { // Use squared distance to avoid sqrt
        resultCache[key] = previousColor
      }
    }
    
    // Update previous colors for next frame
    previousColors = resultCache
    return resultCache
  }
  
  /// Fast squared distance calculation (avoids sqrt)
  private func fastColorDistance(_ color1: String, _ color2: String) -> Int {
    guard let rgb1 = hexToRGBFast(color1), let rgb2 = hexToRGBFast(color2) else { return 0 }
    
    let deltaR = rgb1.r - rgb2.r
    let deltaG = rgb1.g - rgb2.g 
    let deltaB = rgb1.b - rgb2.b
    
    return deltaR * deltaR + deltaG * deltaG + deltaB * deltaB
  }
  
  /// Optimized hex to RGB conversion without string processing
  private func hexToRGBFast(_ hex: String) -> (r: Int, g: Int, b: Int)? {
    guard hex.count == 7, hex.first == "#" else { return nil }
    
    let scanner = Scanner(string: String(hex.dropFirst()))
    var hexNumber: UInt64 = 0
    
    if scanner.scanHexInt64(&hexNumber) {
      return (r: Int((hexNumber & 0xFF0000) >> 16),
              g: Int((hexNumber & 0x00FF00) >> 8),
              b: Int(hexNumber & 0x0000FF))
    }
    return nil
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
      return previousColors.isEmpty ? nil : previousColors // Return cached result
    }
    lastProcessTime = currentTime
    
    // Extract image buffer from frame
    guard let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer) else {
      return previousColors.isEmpty ? nil : previousColors
    }
    
    // Create CIImage from buffer - this is lightweight
    let ciImage = CIImage(cvPixelBuffer: imageBuffer)
    
    // Downsample image for better performance
    let downsampledImage = downsampleImage(ciImage)
    
    // Convert to CGImage for processing
    guard let cgImage = Self.context.createCGImage(downsampledImage, from: downsampledImage.extent) else {
      return previousColors.isEmpty ? nil : previousColors
    }
    
    // Create UIImage for color extraction
    let image = UIImage(cgImage: cgImage)
    
    // Extract colors using MMCQ algorithm - this updates resultCache directly
    guard extractColorsUsingMMCQ(from: image) != nil else {
      return previousColors.isEmpty ? nil : previousColors
    }
    
    // Return the pre-populated result cache
    return resultCache
  }
  
  // Cleanup method to release resources
  deinit {
    resultCache.removeAll()
  }
}

// MARK: - Color Class
public class Color: NSObject {
  public var r: UInt8
  public var g: UInt8
  public var b: UInt8

  init(r: UInt8, g: UInt8, b: UInt8) {
    self.r = r
    self.g = g
    self.b = b
  }

  public func getColors() -> Dictionary<String,UInt8> {
    return ["r":r , "g":g, "b":b]
  }
  
  public func makeUIColor() -> UIColor {
    return UIColor(red: CGFloat(r) / CGFloat(255), green: CGFloat(g) / CGFloat(255), blue: CGFloat(b) / CGFloat(255), alpha: CGFloat(1))
  }
}

// MARK: - MMCQ Algorithm
/// MMCQ (modified median cut quantization) algorithm from
/// the Leptonica library (http://www.leptonica.com/).
open class MMCQ {

  // Use only upper 5 bits of 8 bits
  static let signalBits = 5
  static let rightShift = 8 - signalBits
  static let multiplier = 1 << rightShift
  static let histogramSize = 1 << (3 * signalBits)
  static let vboxLength = 1 << signalBits
  private static let fractionByPopulation = 0.75
  private static let maxIterations = 500 // Reduced for performance

  /// Get reduced-space color index for a pixel.
  static func makeColorIndexOf(red: Int, green: Int, blue: Int) -> Int {
    return (red << (2 * signalBits)) + (green << signalBits) + blue
  }

  enum ColorChannel {
    case r
    case g
    case b
  }

  /// 3D color space box.
  class VBox {

    var rMin: UInt8
    var rMax: UInt8
    var gMin: UInt8
    var gMax: UInt8
    var bMin: UInt8
    var bMax: UInt8

    private let histogram: [Int]

    private var average: Color?
    private var volume: Int?
    private var count: Int?

    init(rMin: UInt8, rMax: UInt8, gMin: UInt8, gMax: UInt8, bMin: UInt8, bMax: UInt8, histogram: [Int]) {
      self.rMin = rMin
      self.rMax = rMax
      self.gMin = gMin
      self.gMax = gMax
      self.bMin = bMin
      self.bMax = bMax
      self.histogram = histogram
    }

    init(vbox: VBox) {
      self.rMin = vbox.rMin
      self.rMax = vbox.rMax
      self.gMin = vbox.gMin
      self.gMax = vbox.gMax
      self.bMin = vbox.bMin
      self.bMax = vbox.bMax
      self.histogram = vbox.histogram
    }

    func makeRange(min: UInt8, max: UInt8) -> CountableRange<Int> {
      if min <= max {
        return Int(min) ..< Int(max + 1)
      } else {
        return Int(max) ..< Int(max)
      }
    }

    var rRange: CountableRange<Int> { return makeRange(min: rMin, max: rMax) }
    var gRange: CountableRange<Int> { return makeRange(min: gMin, max: gMax) }
    var bRange: CountableRange<Int> { return makeRange(min: bMin, max: bMax) }

    /// Get 3 dimensional volume of the color space
    func getVolume(forceRecalculate force: Bool = false) -> Int {
      if let volume = volume, !force {
        return volume
      } else {
        let volume = (Int(rMax) - Int(rMin) + 1) * (Int(gMax) - Int(gMin) + 1) * (Int(bMax) - Int(bMin) + 1)
        self.volume = volume
        return volume
      }
    }

    /// Get total count of histogram samples
    func getCount(forceRecalculate force: Bool = false) -> Int {
      if let count = count, !force {
        return count
      } else {
        var count = 0
        for i in rRange {
          for j in gRange {
            for k in bRange {
              let index = MMCQ.makeColorIndexOf(red: i, green: j, blue: k)
              count += histogram[index]
            }
          }
        }
        self.count = count
        return count
      }
    }

    func getAverage(forceRecalculate force: Bool = false) -> Color {
      if let average = average, !force {
        return average
      } else {
        var ntot = 0

        var rSum = 0
        var gSum = 0
        var bSum = 0

        for i in rRange {
          for j in gRange {
            for k in bRange {
              let index = MMCQ.makeColorIndexOf(red: i, green: j, blue: k)
              let hval = histogram[index]
              ntot += hval
              rSum += Int(Double(hval) * (Double(i) + 0.5) * Double(MMCQ.multiplier))
              gSum += Int(Double(hval) * (Double(j) + 0.5) * Double(MMCQ.multiplier))
              bSum += Int(Double(hval) * (Double(k) + 0.5) * Double(MMCQ.multiplier))
            }
          }
        }

        let average: Color
        if ntot > 0 {
          let r = UInt8(rSum / ntot)
          let g = UInt8(gSum / ntot)
          let b = UInt8(bSum / ntot)
          average = Color(r: r, g: g, b: b)
        } else {
          let r = UInt8(min(MMCQ.multiplier * (Int(rMin) + Int(rMax) + 1) / 2, 255))
          let g = UInt8(min(MMCQ.multiplier * (Int(gMin) + Int(gMax) + 1) / 2, 255))
          let b = UInt8(min(MMCQ.multiplier * (Int(bMin) + Int(bMax) + 1) / 2, 255))
          average = Color(r: r, g: g, b: b)
        }

        self.average = average
        return average
      }
    }

    func widestColorChannel() -> ColorChannel {
      let rWidth = rMax - rMin
      let gWidth = gMax - gMin
      let bWidth = bMax - bMin
      switch max(rWidth, gWidth, bWidth) {
      case rWidth:
        return .r
      case gWidth:
        return .g
      default:
        return .b
      }
    }
  }

  /// Simplified Color map
  open class ColorMap {
    var vboxes = [VBox]()

    func push(_ vbox: VBox) {
      vboxes.append(vbox)
    }

    open func makePalette() -> [Color] {
      return vboxes.map { $0.getAverage() }
    }
  }

  /// Optimized histogram creation using pre-allocated array
  private static func makeHistogramAndVBoxOptimized(from pixels: [UInt8], histogram: inout [Int], quality: Int, ignoreWhite: Bool) -> ([Int], VBox) {
    // Clear histogram efficiently
    for i in 0..<histogram.count {
      histogram[i] = 0
    }
    
    var rMin = UInt8.max
    var rMax = UInt8.min
    var gMin = UInt8.max
    var gMax = UInt8.min
    var bMin = UInt8.max
    var bMax = UInt8.min

    let pixelCount = pixels.count / 4
    for i in stride(from: 0, to: pixelCount, by: quality) {
      let a = pixels[i * 4 + 0]
      let b = pixels[i * 4 + 1]
      let g = pixels[i * 4 + 2]
      let r = pixels[i * 4 + 3]

      guard a >= 125 && !(ignoreWhite && r > 250 && g > 250 && b > 250) else {
        continue
      }

      let shiftedR = r >> UInt8(rightShift)
      let shiftedG = g >> UInt8(rightShift)
      let shiftedB = b >> UInt8(rightShift)

      rMin = min(rMin, shiftedR)
      rMax = max(rMax, shiftedR)
      gMin = min(gMin, shiftedG)
      gMax = max(gMax, shiftedG)
      bMin = min(bMin, shiftedB)
      bMax = max(bMax, shiftedB)

      let index = MMCQ.makeColorIndexOf(red: Int(shiftedR), green: Int(shiftedG), blue: Int(shiftedB))
      histogram[index] += 1
    }

    let vbox = VBox(rMin: rMin, rMax: rMax, gMin: gMin, gMax: gMax, bMin: bMin, bMax: bMax, histogram: histogram)
    return (histogram, vbox)
  }

  /// Original histogram method for compatibility
  private static func makeHistogramAndVBox(from pixels: [UInt8], quality: Int, ignoreWhite: Bool) -> ([Int], VBox) {
    var histogram = [Int](repeating: 0, count: histogramSize)
    var rMin = UInt8.max
    var rMax = UInt8.min
    var gMin = UInt8.max
    var gMax = UInt8.min
    var bMin = UInt8.max
    var bMax = UInt8.min

    let pixelCount = pixels.count / 4
    for i in stride(from: 0, to: pixelCount, by: quality) {
      let a = pixels[i * 4 + 0]
      let b = pixels[i * 4 + 1]
      let g = pixels[i * 4 + 2]
      let r = pixels[i * 4 + 3]

      guard a >= 125 && !(ignoreWhite && r > 250 && g > 250 && b > 250) else {
        continue
      }

      let shiftedR = r >> UInt8(rightShift)
      let shiftedG = g >> UInt8(rightShift)
      let shiftedB = b >> UInt8(rightShift)

      rMin = min(rMin, shiftedR)
      rMax = max(rMax, shiftedR)
      gMin = min(gMin, shiftedG)
      gMax = max(gMax, shiftedG)
      bMin = min(bMin, shiftedB)
      bMax = max(bMax, shiftedB)

      let index = MMCQ.makeColorIndexOf(red: Int(shiftedR), green: Int(shiftedG), blue: Int(shiftedB))
      histogram[index] += 1
    }

    let vbox = VBox(rMin: rMin, rMax: rMax, gMin: gMin, gMax: gMax, bMin: bMin, bMax: bMax, histogram: histogram)
    return (histogram, vbox)
  }

  private static func applyMedianCut(with histogram: [Int], vbox: VBox) -> [VBox] {
    guard vbox.getCount() != 0 else {
      return []
    }

    // only one pixel, no split
    guard vbox.getCount() != 1 else {
      return [vbox]
    }

    // Find the partial sum arrays along the selected axis.
    var total = 0
    var partialSum = [Int](repeating: -1, count: vboxLength) // -1 = not set / 0 = 0
    let axis = vbox.widestColorChannel()
    switch axis {
    case .r:
      for i in vbox.rRange {
        var sum = 0
        for j in vbox.gRange {
          for k in vbox.bRange {
            let index = MMCQ.makeColorIndexOf(red: i, green: j, blue: k)
            sum += histogram[index]
          }
        }
        total += sum
        partialSum[i] = total
      }
    case .g:
      for i in vbox.gRange {
        var sum = 0
        for j in vbox.rRange {
          for k in vbox.bRange {
            let index = MMCQ.makeColorIndexOf(red: j, green: i, blue: k)
            sum += histogram[index]
          }
        }
        total += sum
        partialSum[i] = total
      }
    case .b:
      for i in vbox.bRange {
        var sum = 0
        for j in vbox.rRange {
          for k in vbox.gRange {
            let index = MMCQ.makeColorIndexOf(red: j, green: k, blue: i)
            sum += histogram[index]
          }
        }
        total += sum
        partialSum[i] = total
      }
    }

    var lookAheadSum = [Int](repeating: -1, count: vboxLength) // -1 = not set / 0 = 0
    for (i, sum) in partialSum.enumerated() where sum != -1 {
      lookAheadSum[i] = total - sum
    }

    return cut(by: axis, vbox: vbox, partialSum: partialSum, lookAheadSum: lookAheadSum, total: total)
  }

  private static func cut(by axis: ColorChannel, vbox: VBox, partialSum: [Int], lookAheadSum: [Int], total: Int) -> [VBox] {
    let vboxMin: Int
    let vboxMax: Int

    switch axis {
    case .r:
      vboxMin = Int(vbox.rMin)
      vboxMax = Int(vbox.rMax)
    case .g:
      vboxMin = Int(vbox.gMin)
      vboxMax = Int(vbox.gMax)
    case .b:
      vboxMin = Int(vbox.bMin)
      vboxMax = Int(vbox.bMax)
    }

    for i in vboxMin ... vboxMax where partialSum[i] > total / 2 {
      let vbox1 = VBox(vbox: vbox)
      let vbox2 = VBox(vbox: vbox)

      let left = i - vboxMin
      let right = vboxMax - i

      var d2: Int
      if left <= right {
        d2 = min(vboxMax - 1, i + right / 2)
      } else {
        // 2.0 and cast to int is necessary to have the same
        // behaviour as in JavaScript
        d2 = max(vboxMin, Int(Double(i - 1) - Double(left) / 2.0))
      }

      // avoid 0-count
      while d2 < 0 || partialSum[d2] <= 0 {
        d2 += 1
      }
      var count2 = lookAheadSum[d2]
      while count2 == 0 && d2 > 0 && partialSum[d2 - 1] > 0 {
        d2 -= 1
        count2 = lookAheadSum[d2]
      }

      // set dimensions
      switch axis {
      case .r:
        vbox1.rMax = UInt8(d2)
        vbox2.rMin = UInt8(d2 + 1)
      case .g:
        vbox1.gMax = UInt8(d2)
        vbox2.gMin = UInt8(d2 + 1)
      case .b:
        vbox1.bMax = UInt8(d2)
        vbox2.bMin = UInt8(d2 + 1)
      }

      return [vbox1, vbox2]
    }

    fatalError("VBox can't be cut")
  }

  /// Optimized quantize method using pre-allocated histogram
  static func quantizeOptimized(_ pixels: inout [UInt8], _ histogram: inout [Int], quality: Int, ignoreWhite: Bool, maxColors: Int) -> ColorMap? {
    guard !pixels.isEmpty && maxColors > 1 && maxColors <= 256 else { return nil }

    let (_, vbox) = makeHistogramAndVBoxOptimized(from: pixels, histogram: &histogram, quality: quality, ignoreWhite: ignoreWhite)

    var pq = [vbox]
    let target = Int(ceil(fractionByPopulation * Double(maxColors)))

    iterate(over: &pq, comparator: compareByCount, target: target, histogram: histogram)
    pq.sort(by: compareByProduct)
    iterate(over: &pq, comparator: compareByProduct, target: maxColors - pq.count, histogram: histogram)

    pq = pq.reversed()

    let colorMap = ColorMap()
    pq.forEach { colorMap.push($0) }
    return colorMap
  }
  
  static func quantize(_ pixels: [UInt8], quality: Int, ignoreWhite: Bool, maxColors: Int) -> ColorMap? {
    guard !pixels.isEmpty && maxColors > 1 && maxColors <= 256 else { return nil }

    let (histogram, vbox) = makeHistogramAndVBox(from: pixels, quality: quality, ignoreWhite: ignoreWhite)
    var pq = [vbox]
    let target = Int(ceil(fractionByPopulation * Double(maxColors)))

    iterate(over: &pq, comparator: compareByCount, target: target, histogram: histogram)
    pq.sort(by: compareByProduct)
    iterate(over: &pq, comparator: compareByProduct, target: maxColors - pq.count, histogram: histogram)

    pq = pq.reversed()

    let colorMap = ColorMap()
    pq.forEach { colorMap.push($0) }
    return colorMap
  }

  /// Simplified iteration function
  private static func iterate(over queue: inout [VBox], comparator: (VBox, VBox) -> Bool, target: Int, histogram: [Int]) {
    var color = 1

    for _ in 0..<min(maxIterations, target) {
      guard let vbox = queue.last, vbox.getCount() > 0 else { break }
      
      queue.removeLast()
      let vboxes = applyMedianCut(with: histogram, vbox: vbox)
      
      queue.append(vboxes[0])
      if vboxes.count == 2 {
        queue.append(vboxes[1])
        color += 1
      }
      
      queue.sort(by: comparator)
      
      if color >= target { break }
    }
  }

  private static func compareByCount(_ a: VBox, _ b: VBox) -> Bool {
    return a.getCount() < b.getCount()
  }

  /// Simplified product comparison
  private static func compareByProduct(_ a: VBox, _ b: VBox) -> Bool {
    let aProduct = a.getCount() * a.getVolume()
    let bProduct = b.getCount() * b.getVolume()
    return aProduct < bProduct
  }
}

