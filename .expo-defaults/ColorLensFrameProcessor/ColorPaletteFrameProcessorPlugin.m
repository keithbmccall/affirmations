//
//  ColorPaletteFrameProcessorPlugin.m
//  affirmations
//
//  Created by React Native on 2025.
//

#import <Foundation/Foundation.h>
#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("affirmations-Swift.h")
#import "affirmations-Swift.h"
#else
#import <affirmations-Swift.h>
#endif

VISION_EXPORT_SWIFT_FRAME_PROCESSOR(ColorPaletteFrameProcessorPlugin, getColorPalette) 