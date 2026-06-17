import { VisionCameraProxy } from 'react-native-vision-camera';

export const colorLensRegionFrameProcessorPlugin = VisionCameraProxy.initFrameProcessorPlugin(
  'getColorLensRegion',
  {}
);
