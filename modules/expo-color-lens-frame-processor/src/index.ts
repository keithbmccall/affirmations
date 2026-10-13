import { NitroModules } from 'react-native-nitro-modules';
import type {
  ColorLensPaletteResult,
  ColorLensProcessor,
} from './specs/ColorLensProcessor.nitro';

export type {
  ColorLensPaletteResult,
  ColorLensProcessor,
} from './specs/ColorLensProcessor.nitro';

let processor: ColorLensProcessor | undefined;

/** Lazily create the long-lived ColorLensProcessor HybridObject. */
export function getColorLensProcessor(): ColorLensProcessor {
  if (processor === undefined) {
    processor = NitroModules.createHybridObject<ColorLensProcessor>('ColorLensProcessor');
  }
  return processor;
}
