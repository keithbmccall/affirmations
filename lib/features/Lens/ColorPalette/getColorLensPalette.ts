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

export interface ColorLensPaletteOptions {
  viewportWidth: number;
  viewportHeight: number;
}

const plugin = VisionCameraProxy.initFrameProcessorPlugin('getColorLensPalette', {});

export function getColorLensPalette(
  frame: Frame,
  options: ColorLensPaletteOptions
): ColorLensPaletteType | null {
  'worklet';
  if (plugin === null || plugin === undefined) {
    throw new Error('Failed to load Frame Processor Plugin!');
  }
  return plugin.call(frame, options as unknown as Record<string, number>) as unknown as ColorLensPaletteType | null;
}
