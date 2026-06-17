import { ColorSampleRegion, colorSampleRegionToRadius } from './colorSampleRegion';

describe('colorSampleRegion', () => {
  describe('colorSampleRegionToRadius', () => {
    it('maps SMALL to a normalized radius', () => {
      expect(colorSampleRegionToRadius(ColorSampleRegion.SMALL)).toBe(0.15);
    });

    it('maps LARGE to a normalized radius', () => {
      expect(colorSampleRegionToRadius(ColorSampleRegion.LARGE)).toBe(0.25);
    });
  });
});
