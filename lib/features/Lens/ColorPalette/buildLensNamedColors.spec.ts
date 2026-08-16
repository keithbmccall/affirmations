import { buildLensNamedColors, getLensPaletteCaptureHexes } from './buildLensNamedColors';
import { COLOR_LENS_MODE } from './colorLensMode';
import type { LensPalette } from './types';

describe('buildLensNamedColors', () => {
  it('preserves capture hex and maps pizza + pantone by requestedHex', () => {
    const result = buildLensNamedColors(
      ['#AABBCC', '#111111'],
      [
        {
          name: 'Ice',
          hex: '#aabbc0',
          requestedHex: '#aabbcc',
          distance: 1.5,
          luminance: 50,
          rgb: { r: 170, g: 187, b: 204 },
        },
      ],
      [
        {
          requestedHex: '#111111',
          name: 'black-coffee',
          code: '19-1111',
          hex: '#110f0f',
          distance: 2.2,
        },
      ]
    );

    expect(result).toEqual([
      {
        hex: '#AABBCC',
        name: 'Ice',
        nameDistance: 1.5,
      },
      {
        hex: '#111111',
        pantoneCode: '19-1111',
        pantoneName: 'black-coffee',
        pantoneDistance: 2.2,
      },
    ]);
  });
});

describe('getLensPaletteCaptureHexes', () => {
  it('returns the point capture hex', () => {
    const palette: LensPalette = {
      id: 'p1',
      uri: 'file:///p1.jpg',
      mediaType: 'photo',
      type: COLOR_LENS_MODE.LENS_POINT,
      lensPointColor: { hex: '#AABBCC' },
    };

    expect(getLensPaletteCaptureHexes(palette)).toEqual(['#AABBCC']);
  });

  it('returns dominant palette capture hexes in config order', () => {
    const palette: LensPalette = {
      id: 'p2',
      uri: 'file:///p2.jpg',
      mediaType: 'photo',
      type: COLOR_LENS_MODE.LENS_DOMINANT,
      palette: {
        primaryColor: { hex: '#111111' },
        secondaryColor: { hex: '#222222' },
        tertiaryColor: { hex: '#333333' },
        quaternaryColor: { hex: '#444444' },
        quinaryColor: { hex: '#555555' },
        senaryColor: { hex: '#666666' },
        backgroundColor: { hex: '#777777' },
        detailColor: { hex: '#888888' },
      },
    };

    expect(getLensPaletteCaptureHexes(palette)).toEqual([
      '#111111',
      '#222222',
      '#333333',
      '#444444',
      '#555555',
      '#666666',
      '#777777',
      '#888888',
    ]);
  });
});
