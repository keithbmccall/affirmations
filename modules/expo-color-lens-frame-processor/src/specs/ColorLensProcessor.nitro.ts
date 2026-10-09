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

/** BGRA uint8 interleaved pixels from a region crop (owned ArrayBuffer). */
export interface ColorLensRegionPixels {
  pixels: ArrayBuffer;
  width: number;
  height: number;
}

/**
 * Long-lived Nitro processor for color-lens MMCQ.
 * - extractPalette: uint8 RGB interleaved ArrayBuffer (from vision-camera-resizer)
 * - copyRegion: CI crop+render into owned BGRA bytes (release Frame before MMCQ)
 * - extractDominantColor: BGRA ArrayBuffer → dominant hex
 */
export interface ColorLensProcessor extends HybridObject<{ ios: 'swift' }> {
  extractPalette(
    pixels: ArrayBuffer,
    width: number,
    height: number
  ): ColorLensPaletteResult | undefined;

  copyRegion(
    frame: Frame,
    left: number,
    top: number,
    right: number,
    bottom: number
  ): ColorLensRegionPixels | undefined;

  extractDominantColor(
    pixels: ArrayBuffer,
    width: number,
    height: number
  ): string | undefined;
}
