import {
  COLOR_LENS_MODE,
  colorLensModeOptions,
  isColorLensActive,
  isColorLensDominant,
  isColorLensPoint,
  nextColorLensMode,
} from './colorLensMode';

describe('colorLensMode', () => {
  describe('isColorLensActive', () => {
    it('returns false only for disabled mode', () => {
      expect(isColorLensActive(COLOR_LENS_MODE.DISABLED)).toBe(false);
      expect(isColorLensActive(COLOR_LENS_MODE.LENS_DOMINANT)).toBe(true);
      expect(isColorLensActive(COLOR_LENS_MODE.LENS_POINT)).toBe(true);
    });
  });

  describe('isColorLensDominant', () => {
    it('returns true only for lens-dominant mode', () => {
      expect(isColorLensDominant(COLOR_LENS_MODE.DISABLED)).toBe(false);
      expect(isColorLensDominant(COLOR_LENS_MODE.LENS_DOMINANT)).toBe(true);
      expect(isColorLensDominant(COLOR_LENS_MODE.LENS_POINT)).toBe(false);
    });
  });

  describe('isColorLensPoint', () => {
    it('returns true only for lens-point mode', () => {
      expect(isColorLensPoint(COLOR_LENS_MODE.DISABLED)).toBe(false);
      expect(isColorLensPoint(COLOR_LENS_MODE.LENS_DOMINANT)).toBe(false);
      expect(isColorLensPoint(COLOR_LENS_MODE.LENS_POINT)).toBe(true);
    });
  });

  describe('nextColorLensMode', () => {
    it('cycles through colorLensModeOptions in order', () => {
      expect(nextColorLensMode(COLOR_LENS_MODE.DISABLED)).toBe(COLOR_LENS_MODE.LENS_DOMINANT);
      expect(nextColorLensMode(COLOR_LENS_MODE.LENS_DOMINANT)).toBe(COLOR_LENS_MODE.LENS_POINT);
      expect(nextColorLensMode(COLOR_LENS_MODE.LENS_POINT)).toBe(COLOR_LENS_MODE.DISABLED);
    });

    it('returns the first option when mode is unknown', () => {
      expect(nextColorLensMode('unknown' as typeof COLOR_LENS_MODE.DISABLED)).toBe(
        colorLensModeOptions[0]
      );
    });
  });
});
