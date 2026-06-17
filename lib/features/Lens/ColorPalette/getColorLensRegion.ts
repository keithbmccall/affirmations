import { Frame } from 'react-native-vision-camera';
import { colorLensRegionFrameProcessorPlugin } from './colorLensRegionFrameProcessorPlugin';

export interface ColorLensRegionOptions {
  centerX: number;
  centerY: number;
  radius: number;
}

export function getColorLensRegion(
  frame: Frame,
  options: ColorLensRegionOptions
): string | null {
  'worklet';
  if (
    colorLensRegionFrameProcessorPlugin === null ||
    colorLensRegionFrameProcessorPlugin === undefined
  ) {
    throw new Error('Failed to load getColorLensRegion plugin');
  }
  return colorLensRegionFrameProcessorPlugin.call(
    frame,
    options as unknown as Record<string, number>
  ) as unknown as string | null;
}
