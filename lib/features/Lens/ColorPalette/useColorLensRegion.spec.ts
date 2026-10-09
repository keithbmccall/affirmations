import { act, renderHook } from '@testing-library/react-native';
import type { ColorLensRegionPixels } from 'expo-color-lens-frame-processor';
import type { Frame } from 'react-native-vision-camera';

import { lensPaletteConfig } from './lensPaletteConfig';
import { useColorLensRegion } from './useColorLensRegion';

const mockCopyColorLensRegion = jest.fn();
const mockExtractColorLensRegionColor = jest.fn();
const mockProcessor = {
  copyRegion: jest.fn(),
  extractDominantColor: jest.fn(),
};

jest.mock('expo-color-lens-frame-processor', () => ({
  getColorLensProcessor: () => mockProcessor,
}));

jest.mock('./getColorLensRegion', () => ({
  copyColorLensRegion: (...args: unknown[]) => mockCopyColorLensRegion(...args),
  extractColorLensRegionColor: (...args: unknown[]) =>
    mockExtractColorLensRegionColor(...args),
}));

const mockFrame = {} as Frame;

const regionOptions = {
  left: 10,
  top: 20,
  right: 30,
  bottom: 40,
};

const mockRegionPixels: ColorLensRegionPixels = {
  pixels: new ArrayBuffer(16),
  width: 2,
  height: 2,
};

describe('useColorLensRegion', () => {
  beforeEach(() => {
    mockCopyColorLensRegion.mockReset();
    mockExtractColorLensRegionColor.mockReset();
  });

  it('returns regionColor initialized to the default palette color', () => {
    const { result } = renderHook(() => useColorLensRegion());

    expect(result.current.regionColor.value).toBe(lensPaletteConfig.defaultColor);
  });

  it('copies region pixels via copyColorLensRegionWorklet', () => {
    mockCopyColorLensRegion.mockReturnValue(mockRegionPixels);

    const { result } = renderHook(() => useColorLensRegion());

    let copied: ColorLensRegionPixels | null = null;
    act(() => {
      copied = result.current.copyColorLensRegionWorklet(mockFrame, regionOptions);
    });

    expect(mockCopyColorLensRegion).toHaveBeenCalledWith(
      mockProcessor,
      mockFrame,
      regionOptions
    );
    expect(copied).toBe(mockRegionPixels);
  });

  it('updates regionColor when applyColorLensRegionColorWorklet receives a color', () => {
    mockExtractColorLensRegionColor.mockReturnValue('#AABBCC');

    const { result } = renderHook(() => useColorLensRegion());

    act(() => {
      result.current.applyColorLensRegionColorWorklet(mockRegionPixels);
    });

    expect(mockExtractColorLensRegionColor).toHaveBeenCalledWith(
      mockProcessor,
      mockRegionPixels
    );
    expect(result.current.regionColor.value).toBe('#AABBCC');
  });

  it('keeps the previous regionColor when extractColorLensRegionColor returns null', () => {
    mockExtractColorLensRegionColor
      .mockReturnValueOnce('#AABBCC')
      .mockReturnValueOnce(null);

    const { result } = renderHook(() => useColorLensRegion());

    act(() => {
      result.current.applyColorLensRegionColorWorklet(mockRegionPixels);
    });
    act(() => {
      result.current.applyColorLensRegionColorWorklet(mockRegionPixels);
    });

    expect(result.current.regionColor.value).toBe('#AABBCC');
  });
});
