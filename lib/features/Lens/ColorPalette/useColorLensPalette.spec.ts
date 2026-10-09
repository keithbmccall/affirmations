import { act, renderHook } from '@testing-library/react-native';

import { COLOR_LENS_MODE } from './colorLensMode';
import { lensPaletteConfig } from './lensPaletteConfig';
import { useColorLensPalette } from './useColorLensPalette';

const mockGetColorLensPalette = jest.fn();
const mockProcessor = { extractPalette: jest.fn() };

jest.mock('expo-color-lens-frame-processor', () => ({
  getColorLensProcessor: () => mockProcessor,
}));

jest.mock('./getColorLensPalette', () => ({
  getColorLensPalette: (...args: unknown[]) => mockGetColorLensPalette(...args),
}));

const paletteOptions = {
  pixels: new ArrayBuffer(12),
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

describe('useColorLensPalette', () => {
  beforeEach(() => {
    mockGetColorLensPalette.mockReset();
  });

  it('returns colorLensMode disabled and palette SharedValues at the default color', () => {
    const { result } = renderHook(() => useColorLensPalette());

    expect(result.current.colorLensMode).toBe(COLOR_LENS_MODE.DISABLED);
    expect(result.current.palette.primaryColor.value).toBe(lensPaletteConfig.defaultColor);
    expect(result.current.palette.secondaryColor.value).toBe(lensPaletteConfig.defaultColor);
  });

  it('updates palette SharedValues when getColorLensPaletteWorklet receives colors', () => {
    mockGetColorLensPalette.mockReturnValue(mockPalette);

    const { result } = renderHook(() => useColorLensPalette());

    act(() => {
      result.current.getColorLensPaletteWorklet(paletteOptions);
    });

    expect(mockGetColorLensPalette).toHaveBeenCalledWith(mockProcessor, paletteOptions);
    expect(result.current.palette.primaryColor.value).toBe(mockPalette.primary);
    expect(result.current.palette.detailColor.value).toBe(mockPalette.detail);
  });

  it('keeps previous palette SharedValues when getColorLensPalette returns null', () => {
    mockGetColorLensPalette.mockReturnValueOnce(mockPalette).mockReturnValueOnce(null);

    const { result } = renderHook(() => useColorLensPalette());

    act(() => {
      result.current.getColorLensPaletteWorklet(paletteOptions);
    });
    act(() => {
      result.current.getColorLensPaletteWorklet(paletteOptions);
    });

    expect(result.current.palette.primaryColor.value).toBe(mockPalette.primary);
  });

  it('updates colorLensMode via setColorLensMode', () => {
    const { result } = renderHook(() => useColorLensPalette());

    act(() => {
      result.current.setColorLensMode(COLOR_LENS_MODE.LENS_POINT);
    });

    expect(result.current.colorLensMode).toBe(COLOR_LENS_MODE.LENS_POINT);
  });
});
