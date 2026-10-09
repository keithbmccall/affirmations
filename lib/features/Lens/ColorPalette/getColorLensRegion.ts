import type {
  ColorLensProcessor,
  ColorLensRegionPixels,
} from 'expo-color-lens-frame-processor';
import type { Frame } from 'react-native-vision-camera';

/** Axis-aligned rect in raw CVPixelBuffer pixel coordinates (top-left origin). */
export interface ColorLensRegionOptions {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type { ColorLensRegionPixels };

/**
 * Call from a frame worklet with a processor created on the RN JS thread.
 * Do not call `getColorLensProcessor()` inside the worklet — that is a remote RN function.
 *
 * Returns owned RGB interleaved pixels so the camera Frame can be disposed before MMCQ.
 */
export function copyColorLensRegion(
  processor: ColorLensProcessor,
  frame: Frame,
  options: ColorLensRegionOptions
): ColorLensRegionPixels | null {
  'worklet';
  return (
    processor.copyRegion(
      frame,
      options.left,
      options.top,
      options.right,
      options.bottom
    ) ?? null
  );
}

/**
 * Run after disposing the camera Frame. Consumes RGB pixels from `copyColorLensRegion`
 * (same MMCQ layout as dominant palette).
 */
export function extractColorLensRegionColor(
  processor: ColorLensProcessor,
  region: ColorLensRegionPixels
): string | null {
  'worklet';
  return (
    processor.extractDominantColor(region.pixels, region.width, region.height) ?? null
  );
}
