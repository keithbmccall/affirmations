import { Frame, VisionCameraProxy } from 'react-native-vision-camera';

// Type definition for the color palette returned by the Swift frame processor
export interface ColorLensPaletteType {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
  senary: string;
  background: string;
  detail: string;
}

const plugin = VisionCameraProxy.initFrameProcessorPlugin('getColorLensPalette', {
  name: 'getColorLensPalette',
  type: 'frameProcessor',
});

export function getColorLensPalette(frame: Frame): ColorLensPaletteType | null {
  'worklet';
  if (plugin == null) {
    throw new Error('Failed to load Frame Processor Plugin!');
  }
  return plugin.call(frame) as unknown as ColorLensPaletteType | null;
}
