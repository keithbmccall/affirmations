import {
  buildBrightnessColorMatrix,
  buildLinearContrastColorMatrix,
  buildUniformSaturationColorMatrix,
} from '@features/Lens/Obskura/obskuraLensColorMatrix';
import { buildTameRedSaturationColorMatrix } from '@features/Lens/Obskura/obskuraTameRedConfig';
import { buildObskuraToneCurveImageFilter } from '@features/Lens/Obskura/obskuraToneCurve';
import { OBSKURA_COLOR_MODE, type ObskuraColorMode } from '@features/Lens/Obskura/options';
import { Skia, TileMode, type SkPaint } from '@shopify/react-native-skia';

/**
 * Blur strength (Gaussian sigma) at {@link OBSKURA_LENS_BLUR_REFERENCE_SHORT_SIDE}.
 * Higher = heavier preview + more GPU work per frame.
 * If the app gets hot or crashes in Obskura mode, lower this before changing FPS.
 */
export const OBSKURA_LENS_BLUR_SIGMA = 60;
/**
 * Short-side length (px) that {@link OBSKURA_LENS_BLUR_SIGMA} is tuned for. Live preview
 * runs at roughly HD-class frame sizes; full-res stills are larger, so export scales
 * sigma by `outputShortSide / this` so blur matches preview intensity.
 */
export const OBSKURA_LENS_BLUR_REFERENCE_SHORT_SIDE = 1080;
/** Morphology radius before blur; values > 0 expand dark regions (often reads as black crush). */
export const OBSKURA_LENS_ERODE_RADIUS = 0;

export interface CreateObskuraLensPaintOptions {
  /** When set (e.g. still width/height min), blur sigma is scaled vs {@link OBSKURA_LENS_BLUR_REFERENCE_SHORT_SIDE}. */
  outputShortSidePx?: number;
}
/** Linear contrast around mid-gray (`t = 0.5 * (1 - c)`). 1.0 = neutral; high values crush shadows to black. */
export const OBSKURA_LENS_CONTRAST = 2.0;
export const OBSKURA_LENS_SATURATION = 6;
/** Uniform RGB offset after contrast; small positive lifts shadow floor without heavy contrast crush. */
export const OBSKURA_LENS_BRIGHTNESS = -0.01;

/**
 * Builds the same lens paint used by the Obskura camera preview and still export.
 * Filter order: optional erode → blur → tone curve → brightness → contrast → saturation.
 * Pass {@link CreateObskuraLensPaintOptions.outputShortSidePx} when painting a full-res
 * photo so blur strength matches the on-screen preview.
 * Caller must call `dispose()` when done.
 */
export function createObskuraLensPaint(
  colorMode: ObskuraColorMode,
  options?: CreateObskuraLensPaintOptions
): SkPaint {
  const blurSigma =
    options?.outputShortSidePx !== undefined
      ? (OBSKURA_LENS_BLUR_SIGMA * options.outputShortSidePx) /
        OBSKURA_LENS_BLUR_REFERENCE_SHORT_SIDE
      : OBSKURA_LENS_BLUR_SIGMA;

  const contrastFilter = Skia.ColorFilter.MakeMatrix(
    buildLinearContrastColorMatrix(OBSKURA_LENS_CONTRAST)
  );
  const brightnessFilter = Skia.ColorFilter.MakeMatrix(
    buildBrightnessColorMatrix(OBSKURA_LENS_BRIGHTNESS)
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

  const colorFilter = Skia.ColorFilter.MakeCompose(
    saturationFilter,
    Skia.ColorFilter.MakeCompose(contrastFilter, brightnessFilter)
  );
  const blurInput =
    OBSKURA_LENS_ERODE_RADIUS > 0
      ? Skia.ImageFilter.MakeErode(OBSKURA_LENS_ERODE_RADIUS, OBSKURA_LENS_ERODE_RADIUS, null)
      : null;
  const blurFilter = Skia.ImageFilter.MakeBlur(blurSigma, blurSigma, TileMode.Clamp, blurInput);
  const toneFilter = buildObskuraToneCurveImageFilter(blurFilter);
  const composed = Skia.ImageFilter.MakeColorFilter(colorFilter, toneFilter);

  const paint = Skia.Paint();
  paint.setImageFilter(composed);
  return paint;
}
