import {
  SKIA_REC709_LUMA,
  buildLinearContrastColorMatrix,
  buildUniformSaturationColorMatrix,
} from '@features/lens/camera/skia-matrix-configs/skia-lens-color-matrix';

describe('skia-lens-color-matrix', () => {
  it('exposes Rec. 709 luma weights', () => {
    expect(SKIA_REC709_LUMA).toEqual({ r: 0.213, g: 0.715, b: 0.072 });
  });

  it('buildLinearContrastColorMatrix returns 20 coefficients in Skia 4×5 row-major order', () => {
    const c = 1.5;
    const t = 0.5 * (1 - c);
    expect(buildLinearContrastColorMatrix(c)).toEqual([
      c,
      0,
      0,
      0,
      t,
      0,
      c,
      0,
      0,
      t,
      0,
      0,
      c,
      0,
      t,
      0,
      0,
      0,
      1,
      0,
    ]);
  });

  it('buildUniformSaturationColorMatrix matches legacy lens saturation row for s=5', () => {
    const s = 5;
    const lr = SKIA_REC709_LUMA.r;
    const lg = SKIA_REC709_LUMA.g;
    const lb = SKIA_REC709_LUMA.b;
    const sr = (1 - s) * lr;
    const sg = (1 - s) * lg;
    const sb = (1 - s) * lb;

    expect(buildUniformSaturationColorMatrix(s)).toEqual([
      sr + s,
      sg,
      sb,
      0,
      0,
      sr,
      sg + s,
      sb,
      0,
      0,
      sr,
      sg,
      sb + s,
      0,
      0,
      0,
      0,
      0,
      1,
      0,
    ]);
  });
});
