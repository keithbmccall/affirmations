import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { normalizeLensPalettesMap } from './normalizeLensPalettesMap';

const dominantPalette = {
  primaryColor: '#111111',
  secondaryColor: '#222222',
  tertiaryColor: '#333333',
  quaternaryColor: '#444444',
  quinaryColor: '#555555',
  senaryColor: '#666666',
  backgroundColor: '#777777',
  detailColor: '#888888',
};

describe('normalizeLensPalettesMap', () => {
  it('returns an empty map for non-object input', () => {
    expect(normalizeLensPalettesMap(undefined)).toEqual({});
    expect(normalizeLensPalettesMap(null)).toEqual({});
    expect(normalizeLensPalettesMap([])).toEqual({});
  });

  it('stamps legacy entries without type as lens-dominant', () => {
    const result = normalizeLensPalettesMap({
      'photo-1': {
        id: 'photo-1',
        uri: 'file:///photo-1.jpg',
        mediaType: 'photo',
        palette: dominantPalette,
      },
    });

    expect(result['photo-1']).toEqual({
      id: 'photo-1',
      uri: 'file:///photo-1.jpg',
      mediaType: 'photo',
      type: COLOR_LENS_MODE.LENS_DOMINANT,
      palette: dominantPalette,
    });
  });

  it('preserves lens-point entries', () => {
    const result = normalizeLensPalettesMap({
      'photo-2': {
        id: 'photo-2',
        uri: 'file:///photo-2.jpg',
        mediaType: 'photo',
        type: COLOR_LENS_MODE.LENS_POINT,
        lensPointColor: '#AABBCC',
      },
    });

    expect(result['photo-2']).toEqual({
      id: 'photo-2',
      uri: 'file:///photo-2.jpg',
      mediaType: 'photo',
      type: COLOR_LENS_MODE.LENS_POINT,
      lensPointColor: '#AABBCC',
    });
  });

  it('skips malformed entries', () => {
    const result = normalizeLensPalettesMap({
      bad: { id: 'bad' },
      alsoBad: {
        id: 'also-bad',
        uri: 'file:///x.jpg',
        mediaType: 'photo',
        type: COLOR_LENS_MODE.LENS_POINT,
      },
      good: {
        id: 'good',
        uri: 'file:///good.jpg',
        mediaType: 'photo',
        type: COLOR_LENS_MODE.LENS_DOMINANT,
        palette: dominantPalette,
      },
    });

    expect(Object.keys(result)).toEqual(['good']);
    expect(result.good.type).toBe(COLOR_LENS_MODE.LENS_DOMINANT);
  });
});
