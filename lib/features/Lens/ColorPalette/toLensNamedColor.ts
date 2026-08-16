import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { lensPaletteConfig } from '@features/Lens/ColorPalette/lensPaletteConfig';
import type {
  LensDominantPaletteColors,
  LensNamedColor,
  LensPhotoCaptureContext,
} from '@features/Lens/ColorPalette/types';

type LensPointCaptureContext = Extract<
  LensPhotoCaptureContext,
  { type: typeof COLOR_LENS_MODE.LENS_POINT }
>;

type LensDominantCaptureContext = Extract<
  LensPhotoCaptureContext,
  { type: typeof COLOR_LENS_MODE.LENS_DOMINANT }
>;

/** Point capture context + namedColors → `lensPointColor` (capture hex is source of truth). */
export const toLensNamedColor = (
  context: LensPointCaptureContext,
  namedColors: LensNamedColor[]
): LensNamedColor => namedColors[0] ?? { hex: context.lensPointColor };

/** Dominant capture context + namedColors → `palette` (capture hexes are source of truth). */
export const toLensDominantPaletteColors = (
  context: LensDominantCaptureContext,
  namedColors: LensNamedColor[]
): LensDominantPaletteColors => {
  const palette = {} as LensDominantPaletteColors;

  lensPaletteConfig.colorPaletteKeys.forEach((key, index) => {
    const slotKey = key as keyof LensDominantPaletteColors;
    palette[slotKey] =
      namedColors[index] ?? { hex: context.paletteSnapshot[slotKey] };
  });

  return palette;
};
