import CoreVideo
import Foundation

/// Strided nearest-neighbor YUV→RGB sampling from a CVPixelBuffer rect into interleaved RGB.
/// Supports Vision Camera's `pixelFormat: 'yuv'` → `kCVPixelFormatType_420YpCbCr8BiPlanarFullRange`.
enum ColorLensYUVSampler {

  struct SampleResult {
    let byteCount: Int
  }

  /// Sample `rect` (top-left origin, buffer pixels) into a virtual grid capped at `maxSide`,
  /// walking the grid with stride `quality` and writing interleaved RGB into `rgbOut`.
  /// Returns nil when the buffer format is unsupported or the rect is empty.
  static func sampleRegion(
    pixelBuffer: CVPixelBuffer,
    left: Double,
    top: Double,
    right: Double,
    bottom: Double,
    maxSide: CGFloat,
    quality: Int,
    rgbOut: inout [UInt8]
  ) -> SampleResult? {
    let format = CVPixelBufferGetPixelFormatType(pixelBuffer)
    guard format == kCVPixelFormatType_420YpCbCr8BiPlanarFullRange else {
      return nil
    }

    let bufferWidth = CVPixelBufferGetWidth(pixelBuffer)
    let bufferHeight = CVPixelBufferGetHeight(pixelBuffer)
    guard bufferWidth > 0, bufferHeight > 0 else {
      return nil
    }

    let clampedLeft = max(0.0, min(left, Double(bufferWidth)))
    let clampedRight = max(0.0, min(right, Double(bufferWidth)))
    let clampedTop = max(0.0, min(top, Double(bufferHeight)))
    let clampedBottom = max(0.0, min(bottom, Double(bufferHeight)))

    let regionWidth = clampedRight - clampedLeft
    let regionHeight = clampedBottom - clampedTop
    guard regionWidth > 0, regionHeight > 0 else {
      return nil
    }

    let scale = min(1.0, Double(maxSide) / max(regionWidth, regionHeight))
    let gridWidth = max(1, Int(floor(regionWidth * scale)))
    let gridHeight = max(1, Int(floor(regionHeight * scale)))
    let gridPixelCount = gridWidth * gridHeight
    let strideQuality = max(1, quality)
    let sampleCount = (gridPixelCount + strideQuality - 1) / strideQuality
    guard sampleCount > 0 else {
      return nil
    }

    let byteCount = sampleCount * 3
    if rgbOut.count != byteCount {
      rgbOut = Array(repeating: 0, count: byteCount)
    }

    let matrix = yCbCrMatrix(from: pixelBuffer)
    let convertP3 = hasDisplayP3Primaries(pixelBuffer)

    let lockFlags = CVPixelBufferLockFlags.readOnly
    guard CVPixelBufferLockBaseAddress(pixelBuffer, lockFlags) == kCVReturnSuccess else {
      return nil
    }
    defer { CVPixelBufferUnlockBaseAddress(pixelBuffer, lockFlags) }

    guard let yBase = CVPixelBufferGetBaseAddressOfPlane(pixelBuffer, 0)?.assumingMemoryBound(to: UInt8.self),
          let uvBase = CVPixelBufferGetBaseAddressOfPlane(pixelBuffer, 1)?.assumingMemoryBound(to: UInt8.self) else {
      return nil
    }

    let yBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer, 0)
    let uvBytesPerRow = CVPixelBufferGetBytesPerRowOfPlane(pixelBuffer, 1)

    var outIndex = 0
    for linearIndex in stride(from: 0, to: gridPixelCount, by: strideQuality) {
      let gx = linearIndex % gridWidth
      let gy = linearIndex / gridWidth

      let srcX = Int(clampedLeft + (Double(gx) + 0.5) * regionWidth / Double(gridWidth))
      let srcY = Int(clampedTop + (Double(gy) + 0.5) * regionHeight / Double(gridHeight))
      let x = min(max(srcX, 0), bufferWidth - 1)
      let y = min(max(srcY, 0), bufferHeight - 1)

      let yValue = Int(yBase[y * yBytesPerRow + x])
      let uvX = x / 2
      let uvY = y / 2
      let uvOffset = uvY * uvBytesPerRow + uvX * 2
      let cb = Int(uvBase[uvOffset])
      let cr = Int(uvBase[uvOffset + 1])

      var rgb = matrix.convert(y: yValue, cb: cb, cr: cr)
      if convertP3 {
        rgb = p3ToSRGB(rgb)
      }

      rgbOut[outIndex] = rgb.r
      rgbOut[outIndex + 1] = rgb.g
      rgbOut[outIndex + 2] = rgb.b
      outIndex += 3
    }

    return SampleResult(byteCount: byteCount)
  }

  // MARK: - Color conversion

  private struct RGB8 {
    var r: UInt8
    var g: UInt8
    var b: UInt8
  }

  private struct YCbCrMatrix {
    let kr: Double
    let kg: Double
    let kb: Double

    /// Full-range YCbCr (0…255, chroma centered at 128) → RGB.
    func convert(y: Int, cb: Int, cr: Int) -> RGB8 {
      let yD = Double(y)
      let cbD = Double(cb) - 128.0
      let crD = Double(cr) - 128.0

      let r = yD + 2.0 * (1.0 - kr) * crD
      let g = yD - (2.0 * kb * (1.0 - kb) / kg) * cbD - (2.0 * kr * (1.0 - kr) / kg) * crD
      let b = yD + 2.0 * (1.0 - kb) * cbD

      return RGB8(
        r: clampUInt8(r),
        g: clampUInt8(g),
        b: clampUInt8(b)
      )
    }
  }

  private static let bt601 = YCbCrMatrix(kr: 0.299, kg: 0.587, kb: 0.114)
  private static let bt709 = YCbCrMatrix(kr: 0.2126, kg: 0.7152, kb: 0.0722)

  private static func yCbCrMatrix(from pixelBuffer: CVPixelBuffer) -> YCbCrMatrix {
    guard let attachments = CVBufferCopyAttachments(pixelBuffer, .shouldPropagate) as? [String: Any],
          let matrix = attachments[kCVImageBufferYCbCrMatrixKey as String] as? String else {
      return bt709
    }
    if matrix == (kCVImageBufferYCbCrMatrix_ITU_R_601_4 as String) {
      return bt601
    }
    // Prefer BT.709 for ITU-R 709 / 2020 / unknown (camera preview is typically 709).
    return bt709
  }

  private static func hasDisplayP3Primaries(_ pixelBuffer: CVPixelBuffer) -> Bool {
    guard let attachments = CVBufferCopyAttachments(pixelBuffer, .shouldPropagate) as? [String: Any],
          let primaries = attachments[kCVImageBufferColorPrimariesKey as String] as? String else {
      return false
    }
    return primaries == (kCVImageBufferColorPrimaries_P3_D65 as String)
  }

  private static func clampUInt8(_ value: Double) -> UInt8 {
    if value <= 0 { return 0 }
    if value >= 255 { return 255 }
    return UInt8(value.rounded())
  }

  // MARK: - Display P3 → sRGB

  /// Linearize / encode with the shared sRGB/P3 transfer curve via lookup tables.
  private static let toLinear: [Double] = (0..<256).map { i in
    let c = Double(i) / 255.0
    return c <= 0.04045 ? c / 12.92 : pow((c + 0.055) / 1.055, 2.4)
  }

  private static let fromLinear: [UInt8] = {
    var table = [UInt8](repeating: 0, count: 4097)
    for i in 0...4096 {
      let c = Double(i) / 4096.0
      let encoded = c <= 0.0031308 ? 12.92 * c : 1.055 * pow(c, 1.0 / 2.4) - 0.055
      table[i] = clampUInt8(encoded * 255.0)
    }
    return table
  }()

  /// Display P3 linear RGB → sRGB linear (D65).
  private static func p3ToSRGB(_ rgb: RGB8) -> RGB8 {
    let r = toLinear[Int(rgb.r)]
    let g = toLinear[Int(rgb.g)]
    let b = toLinear[Int(rgb.b)]

    // Bradford-adapted Display P3 → sRGB (linear).
    let rS = 1.224940176 * r - 0.2249401763 * g
    let gS = -0.042056955 * r + 1.042056955 * g
    let bS = -0.019637555 * r - 0.078636046 * g + 1.098273601 * b

    return RGB8(
      r: encodeLinear(rS),
      g: encodeLinear(gS),
      b: encodeLinear(bS)
    )
  }

  private static func encodeLinear(_ value: Double) -> UInt8 {
    let clamped = min(max(value, 0.0), 1.0)
    let index = Int((clamped * 4096.0).rounded())
    return fromLinear[min(max(index, 0), 4096)]
  }
}
