import { NitroModules } from 'react-native-nitro-modules';
import type { ColorLensPalettePlugin } from './specs/ColorLensPalettePlugin.nitro';
import type { ColorLensRegionPlugin } from './specs/ColorLensRegionPlugin.nitro';

export type { ColorLensPalettePlugin, ColorLensPaletteResult } from './specs/ColorLensPalettePlugin.nitro';
export type { ColorLensRegionPlugin } from './specs/ColorLensRegionPlugin.nitro';

export const colorLensPalettePlugin =
  NitroModules.createHybridObject<ColorLensPalettePlugin>('ColorLensPalettePlugin');

export const colorLensRegionPlugin =
  NitroModules.createHybridObject<ColorLensRegionPlugin>('ColorLensRegionPlugin');
