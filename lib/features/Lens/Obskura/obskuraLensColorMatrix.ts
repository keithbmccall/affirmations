/**
 * Shared Rec. 709 luma weights and pure 4×5 color-matrix builders for the Obskura pipeline.
 */

export const OBSKURA_REC709_LUMA = {
  r: 0.213,
  g: 0.715,
  b: 0.072,
} as const;

export type ObskuraRec709Luma = typeof OBSKURA_REC709_LUMA;

/**
 * Linear contrast around mid-gray: `t = 0.5 * (1 - contrast)`. `1.0` = neutral; above 1 increases punch.
 */
export function buildLinearContrastColorMatrix(contrast: number): number[] {
  const c = contrast;
  const t = 0.5 * (1 - c);
  return [c, 0, 0, 0, t, 0, c, 0, 0, t, 0, 0, c, 0, t, 0, 0, 0, 1, 0];
}

/**
 * Standard per-channel saturation matrix (same effective `s` on R, G, B outputs).
 */
export function buildUniformSaturationColorMatrix(
  saturation: number,
  luma: ObskuraRec709Luma = OBSKURA_REC709_LUMA
): number[] {
  const { r: lr, g: lg, b: lb } = luma;
  const s = saturation;
  const sr = (1 - s) * lr;
  const sg = (1 - s) * lg;
  const sb = (1 - s) * lb;

  return [sr + s, sg, sb, 0, 0, sr, sg + s, sb, 0, 0, sr, sg, sb + s, 0, 0, 0, 0, 0, 1, 0];
}
