import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { normalizeLensPalettesMap } from './normalizeLensPalettesMap';

const dominantPalette = {
  primaryColor: { hex: '#111111' },
  secondaryColor: { hex: '#222222' },
  tertiaryColor: { hex: '#333333' },
  quaternaryColor: { hex: '#444444' },
  quinaryColor: { hex: '#555555' },
  senaryColor: { hex: '#666666' },
  backgroundColor: { hex: '#777777' },
  detailColor: { hex: '#888888' },
};

const legacyDominantPalette = {
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
        palette: legacyDominantPalette,
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
      lensPointColor: { hex: '#AABBCC' },
    });
  });

  it('preserves named color enrichment', () => {
    const result = normalizeLensPalettesMap({
      'photo-3': {
        id: 'photo-3',
        uri: 'file:///photo-3.jpg',
        mediaType: 'photo',
        type: COLOR_LENS_MODE.LENS_POINT,
        lensPointColor: {
          hex: '#AABBCC',
          name: 'Cerulean',
          nameDistance: 1.2,
          pantoneCode: '15-4020',
          pantoneName: 'Cerulean',
          pantoneDistance: 2.3,
        },
      },
    });

    expect(result['photo-3']).toMatchObject({
      lensPointColor: {
        hex: '#AABBCC',
        name: 'Cerulean',
        nameDistance: 1.2,
        pantoneCode: '15-4020',
        pantoneName: 'Cerulean',
        pantoneDistance: 2.3,
      },
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
