import type { ColorLensProcessor } from 'expo-color-lens-frame-processor';
import type { Frame } from 'react-native-vision-camera';

/** Axis-aligned rect in raw CVPixelBuffer pixel coordinates (top-left origin). */
export interface ColorLensRegionOptions {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Call from a frame worklet with a processor created on the RN JS thread.
 * Do not call `getColorLensProcessor()` inside the worklet — that is a remote RN function.
 *
 * Samples the frame region via YUV and returns the dominant hex (or null).
 */
export function getColorLensRegionColor(
  processor: ColorLensProcessor,
  frame: Frame,
  options: ColorLensRegionOptions
): string | null {
  'worklet';
  return (
    processor.extractRegionColor(
      frame,
      options.left,
      options.top,
      options.right,
      options.bottom
    ) ?? null
  );
}
