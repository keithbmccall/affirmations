import type {
  ColorLensPaletteResult,
  ColorLensProcessor,
} from 'expo-color-lens-frame-processor';

export type ColorLensPaletteType = ColorLensPaletteResult;

export interface ColorLensPaletteOptions {
  /** uint8 RGB interleaved buffer from vision-camera-resizer */
  pixels: ArrayBuffer;
  width: number;
  height: number;
}

/**
 * Call from a frame worklet with a processor created on the RN JS thread.
 * Do not call `getColorLensProcessor()` inside the worklet — that is a remote RN function.
 */
export function getColorLensPalette(
  processor: ColorLensProcessor,
  options: ColorLensPaletteOptions
): ColorLensPaletteType | null {
  'worklet';
  return (
    processor.extractPalette(options.pixels, options.width, options.height) ?? null
  );
}
