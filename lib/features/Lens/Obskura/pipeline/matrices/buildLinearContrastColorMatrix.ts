/**
 * Linear contrast around mid-gray: `t = 0.5 * (1 - contrast)`. `1.0` = neutral; above 1 increases punch.
 */
export function buildLinearContrastColorMatrix(contrast: number): number[] {
  const c = contrast;
  const t = 0.5 * (1 - c);
  return [c, 0, 0, 0, t, 0, c, 0, 0, t, 0, 0, c, 0, t, 0, 0, 0, 1, 0];
}
