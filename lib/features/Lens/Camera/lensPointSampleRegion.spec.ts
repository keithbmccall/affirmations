import {
  getRegionDiameter,
  getRegionHaloDiameter,
  LENS_POINT_REGION,
} from './lensPointSampleRegion';

describe('getRegionDiameter', () => {
  it('returns 0 when layout short side is not positive', () => {
    expect(getRegionDiameter({ x: 0, y: 0, width: 0, height: 800 })).toBe(0);
    expect(getRegionDiameter({ x: 0, y: 0, width: 400, height: 0 })).toBe(0);
    expect(getRegionDiameter({ x: 0, y: 0, width: 0, height: 0 })).toBe(0);
  });

  it('uses the shorter layout side for the diameter', () => {
    const portrait = getRegionDiameter({ x: 0, y: 0, width: 400, height: 800 });
    const landscape = getRegionDiameter({ x: 0, y: 0, width: 800, height: 400 });

    expect(portrait).toBe(2 * LENS_POINT_REGION.sampleRadius * 400);
    expect(landscape).toBe(portrait);
  });

  it('scales diameter by sample radius and short side', () => {
    expect(getRegionDiameter({ x: 0, y: 0, width: 300, height: 500 })).toBe(
      2 * LENS_POINT_REGION.sampleRadius * 300
    );
  });
});

describe('getRegionHaloDiameter', () => {
  it('returns 0 when layout short side is not positive', () => {
    expect(getRegionHaloDiameter({ x: 0, y: 0, width: 0, height: 800 })).toBe(0);
  });

  it('is haloMultiplier times the sample ring diameter on the same layout', () => {
    const layout = { x: 0, y: 0, width: 400, height: 800 };

    expect(getRegionHaloDiameter(layout)).toBe(
      getRegionDiameter(layout) * LENS_POINT_REGION.haloMultiplier
    );
  });
});
