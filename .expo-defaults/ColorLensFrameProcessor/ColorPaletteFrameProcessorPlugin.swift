//
//  ColorPaletteFrameProcessorPlugin.swift
//  affirmations
//
//  Created by React Native on 2025.
//

import Foundation
import VisionCamera
import CoreImage
import UIKit
import UIImageColors

@objc(ColorPaletteFrameProcessorPlugin)
public class ColorPaletteFrameProcessorPlugin: FrameProcessorPlugin {
  
  public override func callback(_ frame: Frame, withArguments arguments: [AnyHashable : Any]?) -> Any? {
    
    let buffer = frame.buffer
    let ciImage = CIImage(cvImageBuffer: buffer)
    
    // Convert CIImage to UIImage
    let context = CIContext()
    guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else {
      return [
        "error": "Failed to create CGImage from frame"
      ]
    }
    
    let uiImage = UIImage(cgImage: cgImage)
    
    // Resize image for better performance
    let resizedImage = uiImage.resized(to: CGSize(width: 150, height: 150))
    
    // Extract color palette using UIImageColors
    let colors = resizedImage.getColors()
    
    let result: [String: Any] = [
      "colors": [
        "background": colors.background.hexString,
        "primary": colors.primary.hexString,
        "secondary": colors.secondary.hexString,
        "detail": colors.detail.hexString
      ],
      "palette": [
        [
          "color": colors.background.hexString,
          "name": getColorName(from: colors.background),
          "confidence": 0.95
        ],
        [
          "color": colors.primary.hexString,
          "name": getColorName(from: colors.primary),
          "confidence": 0.90
        ],
        [
          "color": colors.secondary.hexString,
          "name": getColorName(from: colors.secondary),
          "confidence": 0.85
        ],
        [
          "color": colors.detail.hexString,
          "name": getColorName(from: colors.detail),
          "confidence": 0.80
        ]
      ],
      "timestamp": Date().timeIntervalSince1970
    ]
    
    return result
  }
  
  private func getColorName(from color: UIColor) -> String {
    let colorNames: [(String, UIColor)] = [
      ("Red", UIColor.red),
      ("Green", UIColor.green),
      ("Blue", UIColor.blue),
      ("Yellow", UIColor.yellow),
      ("Orange", UIColor.orange),
      ("Purple", UIColor.purple),
      ("Pink", UIColor.magenta),
      ("Brown", UIColor.brown),
      ("Black", UIColor.black),
      ("White", UIColor.white),
      ("Gray", UIColor.gray),
      ("Cyan", UIColor.cyan)
    ]
    
    var closestColor = "Unknown"
    var minDistance: CGFloat = CGFloat.greatestFiniteMagnitude
    
    for (name, refColor) in colorNames {
      let distance = color.distance(to: refColor)
      if distance < minDistance {
        minDistance = distance
        closestColor = name
      }
    }
    
    return closestColor
  }
}

// MARK: - UIImage Extensions
extension UIImage {
  func resized(to size: CGSize) -> UIImage {
    let renderer = UIGraphicsImageRenderer(size: size)
    return renderer.image { _ in
      self.draw(in: CGRect(origin: .zero, size: size))
    }
  }
}

// MARK: - UIColor Extensions
extension UIColor {
  var hexString: String {
    let components = self.cgColor.components
    let r: CGFloat = components?[0] ?? 0.0
    let g: CGFloat = components?[1] ?? 0.0
    let b: CGFloat = components?[2] ?? 0.0
    
    let hexString = String.init(format: "#%02lX%02lX%02lX", lroundf(Float(r * 255)), lroundf(Float(g * 255)), lroundf(Float(b * 255)))
    return hexString
  }
  
  func distance(to color: UIColor) -> CGFloat {
    let components1 = self.cgColor.components ?? [0, 0, 0, 1]
    let components2 = color.cgColor.components ?? [0, 0, 0, 1]
    
    let r1 = components1[0]
    let g1 = components1[1]
    let b1 = components1[2]
    
    let r2 = components2[0]
    let g2 = components2[1]
    let b2 = components2[2]
    
    return sqrt(pow(r1 - r2, 2) + pow(g1 - g2, 2) + pow(b1 - b2, 2))
  }
} 