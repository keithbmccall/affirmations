import {
  COLOR_LENS_MODE,
  colorLensModeOrder,
  isColorLensActive,
  isColorLensDominant,
  nextColorLensMode,
} from './colorLensMode';

describe('colorLensMode', () => {
  describe('isColorLensActive', () => {
    it('returns false only for disabled mode', () => {
      expect(isColorLensActive(COLOR_LENS_MODE.DISABLED)).toBe(false);
      expect(isColorLensActive(COLOR_LENS_MODE.LENS_DOMINANT)).toBe(true);
    });
  });

  describe('isColorLensDominant', () => {
    it('returns true only for lens-dominant mode', () => {
      expect(isColorLensDominant(COLOR_LENS_MODE.DISABLED)).toBe(false);
      expect(isColorLensDominant(COLOR_LENS_MODE.LENS_DOMINANT)).toBe(true);
    });
  });

  describe('nextColorLensMode', () => {
    it('cycles disabled ↔ lens-dominant only', () => {
      expect(nextColorLensMode(COLOR_LENS_MODE.DISABLED)).toBe(COLOR_LENS_MODE.LENS_DOMINANT);
      expect(nextColorLensMode(COLOR_LENS_MODE.LENS_DOMINANT)).toBe(COLOR_LENS_MODE.DISABLED);
    });

    it('returns the first option when mode is unknown', () => {
      expect(nextColorLensMode('unknown' as typeof COLOR_LENS_MODE.DISABLED)).toBe(
        colorLensModeOrder[0]
      );
    });
  });
});
