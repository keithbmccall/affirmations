jest.mock('@shopify/react-native-skia', () => ({
  AlphaType: { Unpremul: 3 },
  ColorType: { RGBA_8888: 4 },
  Skia: {
    Data: { fromURI: jest.fn() },
    Image: { MakeImageFromEncoded: jest.fn() },
  },
}));

import { averageHexFromRgbaPixels } from './sampleFrozenFrameColor';

describe('averageHexFromRgbaPixels', () => {
  it('returns undefined for empty buffers', () => {
    expect(averageHexFromRgbaPixels(new Uint8Array(), 0, 0, 0, 0)).toBeUndefined();
  });

  it('averages a solid color patch', () => {
    const width = 3;
    const height = 3;
    const pixels = new Uint8Array(width * height * 4);
    for (let i = 0; i < width * height; i += 1) {
      const index = i * 4;
      pixels[index] = 10;
      pixels[index + 1] = 20;
      pixels[index + 2] = 30;
      pixels[index + 3] = 255;
    }

    expect(averageHexFromRgbaPixels(pixels, width, height, 1, 1, 1)).toBe('#0A141E');
  });

  it('averages only the clamped neighborhood near edges', () => {
    const width = 2;
    const height = 2;
    const pixels = new Uint8Array([
      255, 0, 0, 255, // 0,0 red
      0, 255, 0, 255, // 1,0 green
      0, 0, 255, 255, // 0,1 blue
      255, 255, 255, 255, // 1,1 white
    ]);

    // Center at 0,0 with radius 0 → only red
    expect(averageHexFromRgbaPixels(pixels, width, height, 0, 0, 0)).toBe('#FF0000');
  });
});
