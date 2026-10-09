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

/** RGB uint8 interleaved pixels from a region crop (owned ArrayBuffer; same layout as extractPalette). */
export interface ColorLensRegionPixels {
  pixels: ArrayBuffer;
  width: number;
  height: number;
}

/**
 * Long-lived Nitro processor for color-lens MMCQ.
 * - extractPalette: uint8 RGB interleaved ArrayBuffer (from vision-camera-resizer)
 * - copyRegion: CI crop+render into owned RGB bytes (release Frame before MMCQ)
 * - extractDominantColor: RGB ArrayBuffer → dominant hex (same MMCQ reader as extractPalette)
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
