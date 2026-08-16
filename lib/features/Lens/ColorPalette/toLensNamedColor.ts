import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
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
): LensDominantPaletteColors => ({
  primaryColor: namedColors[0] ?? { hex: context.paletteSnapshot.primaryColor },
  secondaryColor: namedColors[1] ?? { hex: context.paletteSnapshot.secondaryColor },
  tertiaryColor: namedColors[2] ?? { hex: context.paletteSnapshot.tertiaryColor },
  quaternaryColor: namedColors[3] ?? { hex: context.paletteSnapshot.quaternaryColor },
  quinaryColor: namedColors[4] ?? { hex: context.paletteSnapshot.quinaryColor },
  senaryColor: namedColors[5] ?? { hex: context.paletteSnapshot.senaryColor },
  backgroundColor: namedColors[6] ?? { hex: context.paletteSnapshot.backgroundColor },
  detailColor: namedColors[7] ?? { hex: context.paletteSnapshot.detailColor },
});
