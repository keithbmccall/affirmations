import CoreImage
import UIKit
import VisionCamera

struct ColorLensPreviewContext {
  let viewportWidth: CGFloat
  let viewportHeight: CGFloat
  let bufferWidth: CGFloat
  let bufferHeight: CGFloat
  let orientation: UIImage.Orientation
  let isMirrored: Bool

  init?(frame: Frame, arguments: [AnyHashable: Any]?) {
    guard let viewportWidth = ColorLensImagePipeline.normalizedCGFloat(from: arguments?["viewportWidth"]),
          let viewportHeight = ColorLensImagePipeline.normalizedCGFloat(from: arguments?["viewportHeight"]),
          viewportWidth > 0,
          viewportHeight > 0 else {
      return nil
    }

    self.viewportWidth = viewportWidth
    self.viewportHeight = viewportHeight
    self.bufferWidth = CGFloat(frame.width)
    self.bufferHeight = CGFloat(frame.height)
    self.orientation = frame.orientation
    self.isMirrored = frame.isMirrored
  }
}

enum ColorLensImagePipeline {
  static func normalizedCGFloat(from value: Any?) -> CGFloat? {
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

  static func makePreviewAlignedImage(from ciImage: CIImage, context: ColorLensPreviewContext) -> CIImage? {
    guard context.bufferWidth > 0, context.bufferHeight > 0 else {
      return nil
    }

    let oriented = applyOrientationAndMirror(
      to: ciImage,
      orientation: context.orientation,
      isMirrored: context.isMirrored
    )
    let viewAligned = flipToViewCoordinates(oriented)
    let extent = viewAligned.extent

    guard extent.width > 0, extent.height > 0 else {
      return nil
    }

    let viewportAspect = context.viewportWidth / context.viewportHeight
    let cropRect = coverCropRect(
      imageSize: CGSize(width: extent.width, height: extent.height),
      viewportAspect: viewportAspect
    )

    guard let cropRect,
          !cropRect.isNull,
          cropRect.width > 0,
          cropRect.height > 0 else {
      return translateToOrigin(viewAligned)
    }

    return translateToOrigin(viewAligned.cropped(to: cropRect))
  }

  static func cropPointRegion(
    on image: CIImage,
    centerX: CGFloat,
    centerY: CGFloat,
    radius: CGFloat
  ) -> CIImage? {
    let extent = image.extent

    guard extent.width > 0, extent.height > 0 else {
      return nil
    }

    let shortSide = min(extent.width, extent.height)
    let radiusPx = radius * shortSide

    guard radiusPx > 0 else {
      return nil
    }

    let cropRect = CGRect(
      x: centerX * extent.width - radiusPx,
      y: centerY * extent.height - radiusPx,
      width: radiusPx * 2,
      height: radiusPx * 2
    ).intersection(extent)

    guard !cropRect.isNull, cropRect.width > 0, cropRect.height > 0 else {
      return nil
    }

    return image.cropped(to: cropRect)
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
    return ciImage.transformed(by: transform)
  }

  private static func coverCropRect(imageSize: CGSize, viewportAspect: CGFloat) -> CGRect? {
    guard imageSize.width > 0, imageSize.height > 0, viewportAspect > 0 else {
      return nil
    }

    let imageAspect = imageSize.width / imageSize.height

    if imageAspect > viewportAspect {
      let cropWidth = imageSize.height * viewportAspect
      let x = (imageSize.width - cropWidth) / 2.0
      return CGRect(x: x, y: 0, width: cropWidth, height: imageSize.height)
    }

    let cropHeight = imageSize.width / viewportAspect
    let y = (imageSize.height - cropHeight) / 2.0
    return CGRect(x: 0, y: y, width: imageSize.width, height: cropHeight)
  }

  private static func applyOrientationAndMirror(
    to image: CIImage,
    orientation: UIImage.Orientation,
    isMirrored: Bool
  ) -> CIImage {
    let extent = image.extent
    var orientedImage: CIImage

    switch orientation {
    case .up:
      orientedImage = image
    case .down:
      orientedImage = image.transformed(
        by: CGAffineTransform(translationX: extent.width, y: extent.height).rotated(by: .pi)
      )
    case .left:
      orientedImage = image.transformed(
        by: CGAffineTransform(translationX: 0, y: extent.width).rotated(by: -.pi / 2)
      )
    case .right:
      orientedImage = image.transformed(
        by: CGAffineTransform(translationX: extent.height, y: 0).rotated(by: .pi / 2)
      )
    case .upMirrored:
      orientedImage = image.transformed(
        by: CGAffineTransform(translationX: extent.width, y: 0).scaledBy(x: -1, y: 1)
      )
    case .downMirrored:
      orientedImage = image.transformed(
        by: CGAffineTransform(translationX: 0, y: extent.height).scaledBy(x: 1, y: -1)
      )
    case .leftMirrored:
      orientedImage = image.transformed(
        by: CGAffineTransform(translationX: extent.height, y: extent.width)
          .scaledBy(x: -1, y: 1)
          .rotated(by: -.pi / 2)
      )
    case .rightMirrored:
      orientedImage = image.transformed(
        by: CGAffineTransform(scaleX: -1, y: 1).rotated(by: .pi / 2)
          .translatedBy(x: 0, y: -extent.width)
      )
    @unknown default:
      orientedImage = image
    }

    if isMirrored && !orientation.isMirroredVariant {
      let mirroredExtent = orientedImage.extent
      orientedImage = orientedImage.transformed(
        by: CGAffineTransform(translationX: mirroredExtent.width, y: 0).scaledBy(x: -1, y: 1)
      )
    }

    return translateToOrigin(orientedImage)
  }

  private static func flipToViewCoordinates(_ image: CIImage) -> CIImage {
    let extent = image.extent
    let flipped = image.transformed(
      by: CGAffineTransform(translationX: 0, y: extent.height).scaledBy(x: 1, y: -1)
    )
    return translateToOrigin(flipped)
  }

  private static func translateToOrigin(_ image: CIImage) -> CIImage {
    let origin = image.extent.origin
    if origin.x == 0 && origin.y == 0 {
      return image
    }
    return image.transformed(by: CGAffineTransform(translationX: -origin.x, y: -origin.y))
  }
}

private extension UIImage.Orientation {
  var isMirroredVariant: Bool {
    switch self {
    case .upMirrored, .downMirrored, .leftMirrored, .rightMirrored:
      return true
    default:
      return false
    }
  }
}
