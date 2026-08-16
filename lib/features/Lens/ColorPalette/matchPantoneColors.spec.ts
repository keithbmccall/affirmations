import { deltaE76, hexToLab, hexToRgb, rgbToLab } from '@features/Lens/ColorPalette/colorDistanceLab';
import {
  matchPantoneColors,
  resetPantonePaletteCacheForTests,
} from '@features/Lens/ColorPalette/matchPantoneColors';

describe('colorDistanceLab', () => {
  it('parses hex to rgb', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('maps pure black and white to expected Lab L', () => {
    expect(rgbToLab({ r: 0, g: 0, b: 0 }).L).toBeCloseTo(0, 5);
    expect(rgbToLab({ r: 255, g: 255, b: 255 }).L).toBeCloseTo(100, 1);
  });

  it('returns zero Delta E for identical Lab', () => {
    const lab = hexToLab('#aabbcc');
    expect(deltaE76(lab, lab)).toBe(0);
  });
});

describe('matchPantoneColors', () => {
  beforeEach(() => {
    resetPantonePaletteCacheForTests();
  });

  it('returns empty colors for empty or invalid-only input', () => {
    expect(matchPantoneColors([])).toEqual({ colors: [] });
    expect(matchPantoneColors(['#', ''])).toEqual({ colors: [] });
  });

  it('dedupes and preserves order via normalizeHexValues', () => {
    const result = matchPantoneColors(['#F3ECE0', 'f3ece0', '#F2F0EB']);
    expect(result.colors).toHaveLength(2);
    expect(result.colors[0].requestedHex).toBe('#f3ece0');
    expect(result.colors[1].requestedHex).toBe('#f2f0eb');
  });

  it('matches exact palette hexes to their Pantone codes', () => {
    const result = matchPantoneColors(['#f3ece0', '#f2f0eb']);

    expect(result.colors[0]).toMatchObject({
      requestedHex: '#f3ece0',
      code: '11-0103',
      name: 'egret',
      hex: '#f3ece0',
      distance: 0,
    });
    expect(result.colors[1]).toMatchObject({
      requestedHex: '#f2f0eb',
      code: '11-0602',
      name: 'snow-white',
      hex: '#f2f0eb',
      distance: 0,
    });
  });

  it('finds a near-red Pantone for a vivid red hex', () => {
    const result = matchPantoneColors(['#ff0000']);
    expect(result.colors).toHaveLength(1);
    expect(result.colors[0].requestedHex).toBe('#ff0000');
    expect(result.colors[0].code).toMatch(/^\d{2}-\d{4}$/);
    expect(result.colors[0].name.length).toBeGreaterThan(0);
    expect(result.colors[0].hex).toMatch(/^#[0-9a-f]{6}$/);
    expect(result.colors[0].distance).toBeGreaterThanOrEqual(0);
    expect(result.colors[0].distance).toBeLessThan(50);
  });
});
