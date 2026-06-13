import {
  OBSKURA_REC709_LUMA,
  type ObskuraRec709Luma,
} from '@features/Lens/Obskura/pipeline/matrices/obskuraRec709Luma';

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
