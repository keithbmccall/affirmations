import { OBSKURA_COLOR_MODE, type ObskuraColorMode } from '@features/Lens/Obskura/options';
import {
  buildLinearContrastColorMatrix,
  buildUniformSaturationColorMatrix,
} from '@features/Lens/Obskura/obskuraLensColorMatrix';
import { buildTameRedSaturationColorMatrix } from '@features/Lens/Obskura/obskuraTameRedConfig';
import { ColorChannel, Skia, TileMode, type SkPaint } from '@shopify/react-native-skia';

/**
 * Blur strength (Gaussian sigma) at {@link OBSKURA_LENS_BLUR_REFERENCE_SHORT_SIDE}.
 * Higher = heavier preview + more GPU work per frame.
 * If the app gets hot or crashes in Obskura mode, lower this before changing FPS.
 */
export const OBSKURA_LENS_BLUR_SIGMA = 28;
/**
 * Short-side length (px) that {@link OBSKURA_LENS_BLUR_SIGMA} is tuned for. Live preview
 * runs at roughly HD-class frame sizes; full-res stills are larger, so export scales
 * sigma by `outputShortSide / this` so blur matches preview intensity.
 */
export const OBSKURA_LENS_BLUR_REFERENCE_SHORT_SIDE = 1080;
export const OBSKURA_LENS_DISPLACEMENT_SCALE = 12;
export const OBSKURA_LENS_DISPLACEMENT_REFERENCE_SHORT_SIDE = OBSKURA_LENS_BLUR_REFERENCE_SHORT_SIDE;
export const OBSKURA_LENS_DISPLACEMENT_FREQ_X = 0.012;
export const OBSKURA_LENS_DISPLACEMENT_FREQ_Y = 0.02;
export const OBSKURA_LENS_DISPLACEMENT_OCTAVES = 2;
export const OBSKURA_LENS_DISPLACEMENT_SEED = 11;

export interface CreateObskuraLensPaintOptions {
  /** When set (e.g. still width/height min), blur sigma is scaled vs {@link OBSKURA_LENS_BLUR_REFERENCE_SHORT_SIDE}. */
  outputShortSidePx?: number;
}
/** Linear contrast around mid-gray (`t = 0.5 * (1 - c)`). 1.0 = neutral; above 1 increases punch. */
export const OBSKURA_LENS_CONTRAST = 1.28;
export const OBSKURA_LENS_SATURATION = 5;

/**
 * Builds the same lens paint used by the Obskura camera preview and still export.
 * Pass {@link CreateObskuraLensPaintOptions.outputShortSidePx} when painting a full-res
 * photo so blur strength matches the on-screen preview.
 * Caller must call `dispose()` when done.
 */
export function createObskuraLensPaint(
  colorMode: ObskuraColorMode,
  options?: CreateObskuraLensPaintOptions
): SkPaint {
  const outputShortSidePx =
    options?.outputShortSidePx ?? OBSKURA_LENS_DISPLACEMENT_REFERENCE_SHORT_SIDE;
  const blurSigma =
    options?.outputShortSidePx !== undefined
      ? (OBSKURA_LENS_BLUR_SIGMA * options.outputShortSidePx) / OBSKURA_LENS_BLUR_REFERENCE_SHORT_SIDE
      : OBSKURA_LENS_BLUR_SIGMA;
  const displacementScale =
    (OBSKURA_LENS_DISPLACEMENT_SCALE * outputShortSidePx) /
    OBSKURA_LENS_DISPLACEMENT_REFERENCE_SHORT_SIDE;

  const contrastFilter = Skia.ColorFilter.MakeMatrix(
    buildLinearContrastColorMatrix(OBSKURA_LENS_CONTRAST)
  );

  let saturationFilter;
  if (colorMode === OBSKURA_COLOR_MODE.TAME_RED) {
    saturationFilter = Skia.ColorFilter.MakeMatrix(
      buildTameRedSaturationColorMatrix(OBSKURA_LENS_SATURATION)
    );
  } else {
    saturationFilter = Skia.ColorFilter.MakeMatrix(
      buildUniformSaturationColorMatrix(OBSKURA_LENS_SATURATION)
    );
  }

  const colorFilter = Skia.ColorFilter.MakeCompose(saturationFilter, contrastFilter);
  const colorImageFilter = Skia.ImageFilter.MakeColorFilter(colorFilter, null);
  const blurFilter = Skia.ImageFilter.MakeBlur(blurSigma, blurSigma, TileMode.Clamp, null);
  const composed = Skia.ImageFilter.MakeCompose(colorImageFilter, blurFilter);
  const turbulenceShader = Skia.Shader.MakeTurbulence(
    OBSKURA_LENS_DISPLACEMENT_FREQ_X,
    OBSKURA_LENS_DISPLACEMENT_FREQ_Y,
    OBSKURA_LENS_DISPLACEMENT_OCTAVES,
    OBSKURA_LENS_DISPLACEMENT_SEED,
    0,
    0
  );
  const turbulenceFilter = Skia.ImageFilter.MakeShader(turbulenceShader, null);
  const displacedFilter = Skia.ImageFilter.MakeDisplacementMap(
    ColorChannel.G,
    ColorChannel.A,
    displacementScale,
    turbulenceFilter,
    composed
  );

  const paint = Skia.Paint();
  paint.setImageFilter(displacedFilter);
  return paint;
}
