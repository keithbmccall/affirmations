import { OBSKURA_REC709_LUMA } from '@features/Lens/Obskura/pipeline/matrices/obskuraRec709Luma';

/**
 * Tunable color-matrix parameters for the TAME_RED color mode (`OBSKURA_COLOR_MODE` in `options`).
 * Adjust here when testing warm indoor vs daylight / blue-sky scenes — no component edits required.
 */
export interface ObskuraTameRedConfig {
  /**
   * Red output row uses `baseSaturation * redSaturationFactor` as effective saturation `s`.
   * Lower → less red push (stronger tame). Typical range ~0.2–0.45 while iterating.
   */
  redSaturationFactor: number;
  /**
   * Green and blue rows use `baseSaturation * greenBlueSaturationMultiplier`.
   * Raise slightly if tame-red feels flat or skies don't separate from gray;
   * lower if blue skies clip or feel neon after outdoor testing.
   */
  greenBlueSaturationMultiplier: number;
}

/**
 * Live tuning surface for tame-red. Values were validated mainly under warm light;
 * revisit `greenBlueSaturationMultiplier` after blue-sky / daylight passes.
 */
export const OBSKURA_TAME_RED_CONFIG: ObskuraTameRedConfig = {
  redSaturationFactor: 0.28,
  greenBlueSaturationMultiplier: 1.18,
};

/**
 * Builds the 4×5 saturation color-matrix coefficients for tame-red (per-channel saturation).
 */
export function buildTameRedSaturationColorMatrix(
  baseSaturation: number,
  config: ObskuraTameRedConfig = OBSKURA_TAME_RED_CONFIG
): number[] {
  const { redSaturationFactor, greenBlueSaturationMultiplier } = config;
  const { r: LUMA_R, g: LUMA_G, b: LUMA_B } = OBSKURA_REC709_LUMA;

  const sR = baseSaturation * redSaturationFactor;
  const srR = (1 - sR) * LUMA_R;
  const sgR = (1 - sR) * LUMA_G;
  const sbR = (1 - sR) * LUMA_B;

  const sGB = baseSaturation * greenBlueSaturationMultiplier;
  const srGB = (1 - sGB) * LUMA_R;
  const sgGB = (1 - sGB) * LUMA_G;
  const sbGB = (1 - sGB) * LUMA_B;

  return [
    srR + sR,
    sgR,
    sbR,
    0,
    0,
    srGB,
    sgGB + sGB,
    sbGB,
    0,
    0,
    srGB,
    sgGB,
    sbGB + sGB,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}
