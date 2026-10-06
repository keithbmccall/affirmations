import {
  colorLensPalettePlugin,
  type ColorLensPaletteResult,
} from 'expo-color-lens-frame-processor';
import type { Frame } from 'react-native-vision-camera';

export type ColorLensPaletteType = ColorLensPaletteResult;

export interface ColorLensPaletteOptions {
  viewportWidth: number;
  viewportHeight: number;
}

export function getColorLensPalette(
  frame: Frame,
  options: ColorLensPaletteOptions
): ColorLensPaletteType | null {
  'worklet';
  return (
    colorLensPalettePlugin.call(frame, options.viewportWidth, options.viewportHeight) ?? null
  );
}
