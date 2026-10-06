import { colorLensRegionPlugin } from 'expo-color-lens-frame-processor';
import type { Frame } from 'react-native-vision-camera';

export interface ColorLensRegionOptions {
  centerX: number;
  centerY: number;
  radius: number;
  viewportWidth: number;
  viewportHeight: number;
}

export function getColorLensRegion(
  frame: Frame,
  options: ColorLensRegionOptions
): string | null {
  'worklet';
  return (
    colorLensRegionPlugin.call(
      frame,
      options.centerX,
      options.centerY,
      options.radius,
      options.viewportWidth,
      options.viewportHeight
    ) ?? null
  );
}
