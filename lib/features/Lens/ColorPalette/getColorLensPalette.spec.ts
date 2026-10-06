import type { Frame } from 'react-native-vision-camera';
import { getColorLensPalette } from './getColorLensPalette';

const mockPalettePluginCall = jest.fn();

jest.mock('expo-color-lens-frame-processor', () => ({
  colorLensPalettePlugin: {
    call: (...args: unknown[]) => mockPalettePluginCall(...args),
  },
}));

const mockFrame = {} as Frame;

const paletteOptions = {
  viewportWidth: 390,
  viewportHeight: 844,
};

const mockPalette = {
  primary: '#111111',
  secondary: '#222222',
  tertiary: '#333333',
  quaternary: '#444444',
  quinary: '#555555',
  senary: '#666666',
  background: '#777777',
  detail: '#888888',
};

describe('getColorLensPalette', () => {
  beforeEach(() => {
    mockPalettePluginCall.mockReset();
  });

  it('calls the getColorLensPalette plugin with frame and viewport options', () => {
    mockPalettePluginCall.mockReturnValue(mockPalette);

    const result = getColorLensPalette(mockFrame, paletteOptions);

    expect(mockPalettePluginCall).toHaveBeenCalledWith(
      mockFrame,
      paletteOptions.viewportWidth,
      paletteOptions.viewportHeight
    );
    expect(result).toEqual(mockPalette);
  });

  it('returns null when the plugin returns null', () => {
    mockPalettePluginCall.mockReturnValue(null);

    expect(getColorLensPalette(mockFrame, paletteOptions)).toBeNull();
  });
});
