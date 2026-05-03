jest.mock('react-native-vision-camera', () => ({
  VisionCameraProxy: {
    initFrameProcessorPlugin: jest.fn(() => ({
      call: jest.fn(() => ({
        primary: '#111111',
        secondary: '#222222',
        tertiary: '#333333',
        quaternary: '#444444',
        quinary: '#555555',
        senary: '#666666',
        background: '#777777',
        detail: '#888888',
      })),
    })),
  },
}));

import { getColorLensPalette } from '@features/lens/lens-palette/get-color-lens-palette';

describe('get-color-lens-palette (plugin present)', () => {
  it('returns palette data from the native plugin', () => {
    const result = getColorLensPalette({} as never);
    expect(result).toEqual({
      primary: '#111111',
      secondary: '#222222',
      tertiary: '#333333',
      quaternary: '#444444',
      quinary: '#555555',
      senary: '#666666',
      background: '#777777',
      detail: '#888888',
    });
  });
});
