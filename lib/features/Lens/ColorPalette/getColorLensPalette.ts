import type {
  ColorLensPaletteResult,
  ColorLensProcessor,
} from 'expo-color-lens-frame-processor';
import type { Frame } from 'react-native-vision-camera';

export type ColorLensPaletteType = ColorLensPaletteResult;

/** Axis-aligned rect in raw CVPixelBuffer pixel coordinates (top-left origin). */
export interface ColorLensPaletteOptions {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Call from a frame worklet with a processor created on the RN JS thread.
 * Do not call `getColorLensProcessor()` inside the worklet — that is a remote RN function.
 *
 * Samples the frame rect via YUV and returns the 6-slot palette (or null).
 */
export function getColorLensPalette(
  processor: ColorLensProcessor,
  frame: Frame,
  options: ColorLensPaletteOptions
): ColorLensPaletteType | null {
  'worklet';
  return (
    processor.extractFramePalette(
      frame,
      options.left,
      options.top,
      options.right,
      options.bottom
    ) ?? null
  );
}
