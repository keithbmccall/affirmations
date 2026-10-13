import type { ColorLensProcessor } from 'expo-color-lens-frame-processor';
import type { Frame } from 'react-native-vision-camera';
import { getColorLensPalette } from './getColorLensPalette';

const mockExtractFramePalette = jest.fn();

const mockProcessor = {
  extractFramePalette: (...args: unknown[]) => mockExtractFramePalette(...args),
} as unknown as ColorLensProcessor;

const mockFrame = {} as Frame;

const paletteOptions = {
  left: 0,
  top: 0,
  right: 100,
  bottom: 200,
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
    mockExtractFramePalette.mockReset();
  });

  it('calls extractFramePalette with frame and pixel rect', () => {
    mockExtractFramePalette.mockReturnValue(mockPalette);

    const result = getColorLensPalette(mockProcessor, mockFrame, paletteOptions);

    expect(mockExtractFramePalette).toHaveBeenCalledWith(
      mockFrame,
      paletteOptions.left,
      paletteOptions.top,
      paletteOptions.right,
      paletteOptions.bottom
    );
    expect(result).toEqual(mockPalette);
  });

  it('returns null when extractFramePalette returns undefined', () => {
    mockExtractFramePalette.mockReturnValue(undefined);

    expect(getColorLensPalette(mockProcessor, mockFrame, paletteOptions)).toBeNull();
  });
});
