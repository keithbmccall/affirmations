import { getRegionDiameter } from './lensPointSampleRegion';

describe('getRegionDiameter', () => {
  it('returns 0 when layout short side is not positive', () => {
    expect(getRegionDiameter({ x: 0, y: 0, width: 0, height: 800 })).toBe(0);
    expect(getRegionDiameter({ x: 0, y: 0, width: 400, height: 0 })).toBe(0);
    expect(getRegionDiameter({ x: 0, y: 0, width: 0, height: 0 })).toBe(0);
  });

  it('uses the shorter layout side for the diameter', () => {
    const portrait = getRegionDiameter({ x: 0, y: 0, width: 400, height: 800 });
    const landscape = getRegionDiameter({ x: 0, y: 0, width: 800, height: 400 });

    expect(portrait).toBe(64);
    expect(landscape).toBe(portrait);
  });

  it('scales diameter by sample radius, display multiplier, and short side', () => {
    // 2 * 0.01 * 8 * 300 = 48
    expect(getRegionDiameter({ x: 0, y: 0, width: 300, height: 500 })).toBe(48);
  });
});
