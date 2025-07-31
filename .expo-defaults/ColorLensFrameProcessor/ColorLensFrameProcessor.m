#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include("ScheduledAffirmations/ScheduledAffirmations-Swift.h")
#import "ScheduledAffirmations/ScheduledAffirmations-Swift.h"
#else
#import "ScheduledAffirmations-Swift.h"
#endif

VISION_EXPORT_SWIFT_FRAME_PROCESSOR(ColorLensFrameProcessorPlugin, getColorLensPalette)