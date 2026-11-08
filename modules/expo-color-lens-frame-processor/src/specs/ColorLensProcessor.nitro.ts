import type { HybridObject } from 'react-native-nitro-modules';
import type { Frame } from 'react-native-vision-camera';

export interface ColorLensPaletteResult {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  quinary: string;
  senary: string;
  background: string;
  detail: string;
}

/**
 * Long-lived Nitro processor for color-lens MMCQ.
 * - extractFramePalette: YUV sample of axis-aligned buffer rect → 6-slot palette
 */
export interface ColorLensProcessor extends HybridObject<{ ios: 'swift' }> {
  extractFramePalette(
    frame: Frame,
    left: number,
    top: number,
    right: number,
    bottom: number
  ): ColorLensPaletteResult | undefined;
}
