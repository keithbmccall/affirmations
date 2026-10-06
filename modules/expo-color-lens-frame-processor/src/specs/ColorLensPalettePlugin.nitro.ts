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

export interface ColorLensPalettePlugin
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  call(
    frame: Frame,
    viewportWidth: number,
    viewportHeight: number
  ): ColorLensPaletteResult | undefined;
}
