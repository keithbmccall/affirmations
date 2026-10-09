import {
  getLensPointSampleRect,
  getRegionDiameter,
  LENS_POINT_REGION,
} from './lensPointSampleRegion';

describe('getLensPointSampleRect', () => {
  it('returns a zero-size rect when layout short side is not positive', () => {
    expect(getLensPointSampleRect({ x: 0, y: 0, width: 0, height: 800 })).toEqual({
      x: 0,
      y: 0,
      size: 0,
    });
    expect(getLensPointSampleRect({ x: 0, y: 0, width: 400, height: 0 })).toEqual({
      x: 0,
      y: 0,
      size: 0,
    });
  });

  it('returns a centered square sized from sampleRadius and short side', () => {
    const layout = { x: 0, y: 0, width: 400, height: 800 };
    const size = 2 * LENS_POINT_REGION.sampleRadius * 400;

    expect(getLensPointSampleRect(layout)).toEqual({
      x: 200 - size / 2,
      y: 400 - size / 2,
      size,
    });
  });

  it('uses the shorter layout side for size', () => {
    const portrait = getLensPointSampleRect({ x: 0, y: 0, width: 400, height: 800 });
    const landscape = getLensPointSampleRect({ x: 0, y: 0, width: 800, height: 400 });

    expect(portrait.size).toBe(2 * LENS_POINT_REGION.sampleRadius * 400);
    expect(landscape.size).toBe(portrait.size);
  });
});

describe('getRegionDiameter', () => {
  it('returns the sample square side length', () => {
    const layout = { x: 0, y: 0, width: 300, height: 500 };

    expect(getRegionDiameter(layout)).toBe(getLensPointSampleRect(layout).size);
  });
});
