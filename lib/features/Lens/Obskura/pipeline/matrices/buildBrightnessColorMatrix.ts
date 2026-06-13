/**
 * Uniform RGB offset. `0` = neutral; negative darkens (pulls highlights / whites down).
 */
export function buildBrightnessColorMatrix(brightness: number): number[] {
  const b = brightness;
  return [1, 0, 0, 0, b, 0, 1, 0, 0, b, 0, 0, 1, 0, b, 0, 0, 0, 1, 0];
}
