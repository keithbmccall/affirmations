#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include(<ExpoColorLensFrameProcessor/ExpoColorLensFrameProcessor-Swift.h>)
#import <ExpoColorLensFrameProcessor/ExpoColorLensFrameProcessor-Swift.h>
#elif __has_include("ExpoColorLensFrameProcessor-Swift.h")
#import "ExpoColorLensFrameProcessor-Swift.h"
#endif

/**
 * Register in +load (not VISION_EXPORT_SWIFT_FRAME_PROCESSOR’s __attribute__((constructor))).
 * On device, Swift class metadata must be visible to the ObjC runtime before alloc/init;
 * constructor may run too early; +load runs after class wiring and matches VisionCamera’s
 * ObjC-only export pattern (VISION_EXPORT_FRAME_PROCESSOR uses +load).
 */
@interface ColorLensFrameProcessorPlugin (ColorLensRegistration)
@end

@implementation ColorLensFrameProcessorPlugin (ColorLensRegistration)

+ (void)load {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    NSLog(@"[ExpoColorLensFrameProcessor] Registering VisionCamera plugin \"getColorLensPalette\" (+load)");
    [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"getColorLensPalette"
                                         withInitializer:^FrameProcessorPlugin *_Nonnull(VisionCameraProxyHolder *_Nonnull proxy,
                                                                                         NSDictionary *_Nullable options) {
                                           return [[ColorLensFrameProcessorPlugin alloc] initWithProxy:proxy withOptions:options];
                                         }];
    NSLog(@"[ExpoColorLensFrameProcessor] Plugin \"getColorLensPalette\" registered");
  });
}

@end
