import { Frame, VisionCameraProxy } from 'react-native-vision-camera';

const plugin = VisionCameraProxy.initFrameProcessorPlugin('getColorLensPalette', {
  name: 'getColorLensPalette',
  type: 'frameProcessor',
});

export function getColorLensPalette(frame: Frame) {
  'worklet';
  if (plugin == null) {
    throw new Error('Failed to load Frame Processor Plugin!');
  }
  return plugin.call(frame);
}
