import CoreImage

/// Thin CI helpers for region sampling (raw buffer rect → MMCQ-sized image).
enum ColorLensImagePipeline {
  /// Crop a top-left-origin pixel rect from a CVPixelBuffer-backed CIImage.
  /// Flips Y because CI uses a bottom-left origin.
  static func cropBufferRect(
    on image: CIImage,
    left: Double,
    top: Double,
    right: Double,
    bottom: Double,
    bufferWidth: Int,
    bufferHeight: Int
  ) -> CIImage? {
    guard bufferWidth > 0, bufferHeight > 0 else {
      return nil
    }

    let clampedLeft = max(0.0, min(left, Double(bufferWidth)))
    let clampedRight = max(0.0, min(right, Double(bufferWidth)))
    let clampedTop = max(0.0, min(top, Double(bufferHeight)))
    let clampedBottom = max(0.0, min(bottom, Double(bufferHeight)))

    let width = clampedRight - clampedLeft
    let height = clampedBottom - clampedTop
    guard width > 0, height > 0 else {
      return nil
    }

    let ciY = Double(bufferHeight) - clampedBottom
    let cropRect = CGRect(x: clampedLeft, y: ciY, width: width, height: height)
    let cropped = image.cropped(to: cropRect)
    return translateToOrigin(cropped)
  }

  static func downsampleForMMCQ(_ ciImage: CIImage, maxSide: CGFloat) -> CIImage {
    let extent = ciImage.extent
    let width = extent.width
    let height = extent.height

    if width <= maxSide && height <= maxSide {
      return ciImage
    }

    let scale = min(maxSide / width, maxSide / height)
    let transform = CGAffineTransform(scaleX: scale, y: scale)
    return translateToOrigin(ciImage.transformed(by: transform))
  }

  private static func translateToOrigin(_ image: CIImage) -> CIImage {
    let origin = image.extent.origin
    if origin.x == 0 && origin.y == 0 {
      return image
    }
    return image.transformed(by: CGAffineTransform(translationX: -origin.x, y: -origin.y))
  }
}
