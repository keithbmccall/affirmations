import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import {
  toLensDominantPaletteColors,
  toLensNamedColor,
} from '@features/Lens/ColorPalette/toLensNamedColor';
import type { LensNamedColor } from '@features/Lens/ColorPalette/types';

const pointContext = {
  type: COLOR_LENS_MODE.LENS_POINT,
  lensPointColor: '#AABBCC',
} as const;

const dominantContext = {
  type: COLOR_LENS_MODE.LENS_DOMINANT,
  paletteSnapshot: {
    primaryColor: '#111111',
    secondaryColor: '#222222',
    tertiaryColor: '#333333',
    quaternaryColor: '#444444',
    quinaryColor: '#555555',
    senaryColor: '#666666',
    backgroundColor: '#777777',
    detailColor: '#888888',
  },
} as const;

describe('toLensNamedColor', () => {
  it('uses namedColors[0] when present', () => {
    const namedColors: LensNamedColor[] = [
      { hex: '#AABBCC', name: 'Ice', pantoneCode: '15-4020' },
    ];

    expect(toLensNamedColor(pointContext, namedColors)).toEqual(namedColors[0]);
  });

  it('falls back to capture hex when namedColors is empty', () => {
    expect(toLensNamedColor(pointContext, [])).toEqual({ hex: '#AABBCC' });
  });
});

describe('toLensDominantPaletteColors', () => {
  it('maps namedColors onto palette slots in config order', () => {
    const namedColors: LensNamedColor[] = [
      { hex: '#111111', name: 'A' },
      { hex: '#222222', name: 'B' },
    ];

    expect(toLensDominantPaletteColors(dominantContext, namedColors)).toEqual({
      primaryColor: { hex: '#111111', name: 'A' },
      secondaryColor: { hex: '#222222', name: 'B' },
      tertiaryColor: { hex: '#333333' },
      quaternaryColor: { hex: '#444444' },
      quinaryColor: { hex: '#555555' },
      senaryColor: { hex: '#666666' },
      backgroundColor: { hex: '#777777' },
      detailColor: { hex: '#888888' },
    });
  });

  it('falls back to capture hexes when namedColors is empty', () => {
    expect(toLensDominantPaletteColors(dominantContext, [])).toEqual({
      primaryColor: { hex: '#111111' },
      secondaryColor: { hex: '#222222' },
      tertiaryColor: { hex: '#333333' },
      quaternaryColor: { hex: '#444444' },
      quinaryColor: { hex: '#555555' },
      senaryColor: { hex: '#666666' },
      backgroundColor: { hex: '#777777' },
      detailColor: { hex: '#888888' },
    });
  });
});
