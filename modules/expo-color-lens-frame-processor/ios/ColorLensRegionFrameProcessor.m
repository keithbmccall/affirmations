#import <VisionCamera/FrameProcessorPlugin.h>
#import <VisionCamera/FrameProcessorPluginRegistry.h>

#if __has_include(<ExpoColorLensFrameProcessor/ExpoColorLensFrameProcessor-Swift.h>)
#import <ExpoColorLensFrameProcessor/ExpoColorLensFrameProcessor-Swift.h>
#elif __has_include("ExpoColorLensFrameProcessor-Swift.h")
#import "ExpoColorLensFrameProcessor-Swift.h"
#endif

@interface ColorLensRegionFrameProcessorPlugin (ColorLensRegionRegistration)
@end

@implementation ColorLensRegionFrameProcessorPlugin (ColorLensRegionRegistration)

+ (void)load {
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    NSLog(@"[ExpoColorLensFrameProcessor] Registering VisionCamera plugin \"getColorLensRegion\" (+load)");
    [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"getColorLensRegion"
                                         withInitializer:^FrameProcessorPlugin *_Nonnull(VisionCameraProxyHolder *_Nonnull proxy,
                                                                                         NSDictionary *_Nullable options) {
                                           return [[ColorLensRegionFrameProcessorPlugin alloc] initWithProxy:proxy withOptions:options];
                                         }];
    NSLog(@"[ExpoColorLensFrameProcessor] Plugin \"getColorLensRegion\" registered");
  });
}

@end
