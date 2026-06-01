import { SKIA_COLOR_MODE, type SkiaColorMode } from '@features/Lens/Camera/options';
import {
  buildLinearContrastColorMatrix,
  buildUniformSaturationColorMatrix,
} from '@features/Lens/Camera/skia-matrix-configs/skiaLensColorMatrix';
import { buildTameRedSaturationColorMatrix } from '@features/Lens/Camera/skia-matrix-configs/skiaTameRedConfig';
import { ColorChannel, Skia, TileMode, type SkPaint } from '@shopify/react-native-skia';

/**
 * Blur strength (Gaussian sigma) at {@link SKIA_LENS_BLUR_REFERENCE_SHORT_SIDE}.
 * Higher = heavier preview + more GPU work per frame.
 * If the app gets hot or crashes in Skia mode, lower this before changing FPS.
 */
export const SKIA_LENS_BLUR_SIGMA = 40;
/**
 * Short-side length (px) that {@link SKIA_LENS_BLUR_SIGMA} is tuned for. Live preview
 * runs at roughly HD-class frame sizes; full-res stills are larger, so export scales
 * sigma by `outputShortSide / this` so blur matches preview intensity.
 */
export const SKIA_LENS_BLUR_REFERENCE_SHORT_SIDE = 1080;
export const SKIA_LENS_DISPLACEMENT_SCALE = 12;
export const SKIA_LENS_DISPLACEMENT_REFERENCE_SHORT_SIDE = SKIA_LENS_BLUR_REFERENCE_SHORT_SIDE;
export const SKIA_LENS_DISPLACEMENT_FREQ_X = 0.012;
export const SKIA_LENS_DISPLACEMENT_FREQ_Y = 0.02;
export const SKIA_LENS_DISPLACEMENT_OCTAVES = 2;
export const SKIA_LENS_DISPLACEMENT_SEED = 11;

export interface CreateSkiaLensPaintOptions {
  /** When set (e.g. still width/height min), blur sigma is scaled vs {@link SKIA_LENS_BLUR_REFERENCE_SHORT_SIDE}. */
  outputShortSidePx?: number;
}
/** Linear contrast around mid-gray (`t = 0.5 * (1 - c)`). 1.0 = neutral; above 1 increases punch. */
export const SKIA_LENS_CONTRAST = 1.28;
export const SKIA_LENS_SATURATION = 5;

/**
 * Builds the same lens paint used by the Skia camera preview and still export.
 * Pass {@link CreateSkiaLensPaintOptions.outputShortSidePx} when painting a full-res
 * photo so blur strength matches the on-screen preview.
 * Caller must call `dispose()` when done.
 */
export function createSkiaLensPaint(
  colorMode: SkiaColorMode,
  options?: CreateSkiaLensPaintOptions
): SkPaint {
  const outputShortSidePx =
    options?.outputShortSidePx ?? SKIA_LENS_DISPLACEMENT_REFERENCE_SHORT_SIDE;
  const blurSigma =
    options?.outputShortSidePx !== undefined
      ? (SKIA_LENS_BLUR_SIGMA * options.outputShortSidePx) / SKIA_LENS_BLUR_REFERENCE_SHORT_SIDE
      : SKIA_LENS_BLUR_SIGMA;
  const displacementScale =
    (SKIA_LENS_DISPLACEMENT_SCALE * outputShortSidePx) /
    SKIA_LENS_DISPLACEMENT_REFERENCE_SHORT_SIDE;

  const contrastFilter = Skia.ColorFilter.MakeMatrix(
    buildLinearContrastColorMatrix(SKIA_LENS_CONTRAST)
  );

  let saturationFilter;
  if (colorMode === SKIA_COLOR_MODE.TAME_RED) {
    saturationFilter = Skia.ColorFilter.MakeMatrix(
      buildTameRedSaturationColorMatrix(SKIA_LENS_SATURATION)
    );
  } else {
    saturationFilter = Skia.ColorFilter.MakeMatrix(
      buildUniformSaturationColorMatrix(SKIA_LENS_SATURATION)
    );
  }

  const colorFilter = Skia.ColorFilter.MakeCompose(saturationFilter, contrastFilter);
  const colorImageFilter = Skia.ImageFilter.MakeColorFilter(colorFilter, null);
  const blurFilter = Skia.ImageFilter.MakeBlur(blurSigma, blurSigma, TileMode.Clamp, null);
  const composed = Skia.ImageFilter.MakeCompose(colorImageFilter, blurFilter);
  const turbulenceShader = Skia.Shader.MakeTurbulence(
    SKIA_LENS_DISPLACEMENT_FREQ_X,
    SKIA_LENS_DISPLACEMENT_FREQ_Y,
    SKIA_LENS_DISPLACEMENT_OCTAVES,
    SKIA_LENS_DISPLACEMENT_SEED,
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
