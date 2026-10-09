import type { ColorLensProcessor } from 'expo-color-lens-frame-processor';
import { getColorLensPalette } from './getColorLensPalette';

const mockExtractPalette = jest.fn();

const mockProcessor = {
  extractPalette: (...args: unknown[]) => mockExtractPalette(...args),
} as unknown as ColorLensProcessor;

const mockPixels = new ArrayBuffer(12);

const paletteOptions = {
  pixels: mockPixels,
  width: 2,
  height: 2,
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
    mockExtractPalette.mockReset();
  });

  it('calls extractPalette with RGB buffer dimensions', () => {
    mockExtractPalette.mockReturnValue(mockPalette);

    const result = getColorLensPalette(mockProcessor, paletteOptions);

    expect(mockExtractPalette).toHaveBeenCalledWith(
      mockPixels,
      paletteOptions.width,
      paletteOptions.height
    );
    expect(result).toEqual(mockPalette);
  });

  it('returns null when extractPalette returns undefined', () => {
    mockExtractPalette.mockReturnValue(undefined);

    expect(getColorLensPalette(mockProcessor, paletteOptions)).toBeNull();
  });
});
