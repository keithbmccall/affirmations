#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include(<ExpoColorLensFrameProcessor/ExpoColorLensFrameProcessor-Swift.h>)
#import <ExpoColorLensFrameProcessor/ExpoColorLensFrameProcessor-Swift.h>
#elif __has_include("ExpoColorLensFrameProcessor-Swift.h")
#import "ExpoColorLensFrameProcessor-Swift.h"
#endif

VISION_EXPORT_SWIFT_FRAME_PROCESSOR(ColorLensFrameProcessorPlugin, getColorLensPalette)
