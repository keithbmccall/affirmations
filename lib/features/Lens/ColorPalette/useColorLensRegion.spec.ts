import { act, renderHook } from '@testing-library/react-native';
import type { Frame } from 'react-native-vision-camera';

import { lensPaletteConfig } from './lensPaletteConfig';
import { useColorLensRegion } from './useColorLensRegion';

const mockGetColorLensRegionColor = jest.fn();
const mockProcessor = {
  extractRegionColor: jest.fn(),
};

jest.mock('expo-color-lens-frame-processor', () => ({
  getColorLensProcessor: () => mockProcessor,
}));

jest.mock('./getColorLensRegion', () => ({
  getColorLensRegionColor: (...args: unknown[]) => mockGetColorLensRegionColor(...args),
}));

const mockFrame = {} as Frame;

const regionOptions = {
  left: 10,
  top: 20,
  right: 30,
  bottom: 40,
};

describe('useColorLensRegion', () => {
  beforeEach(() => {
    mockGetColorLensRegionColor.mockReset();
  });

  it('returns regionColor initialized to the default palette color', () => {
    const { result } = renderHook(() => useColorLensRegion());

    expect(result.current.regionColor.value).toBe(lensPaletteConfig.defaultColor);
  });

  it('updates regionColor when applyColorLensRegionWorklet receives a color', () => {
    mockGetColorLensRegionColor.mockReturnValue('#AABBCC');

    const { result } = renderHook(() => useColorLensRegion());

    act(() => {
      result.current.applyColorLensRegionWorklet(mockFrame, regionOptions);
    });

    expect(mockGetColorLensRegionColor).toHaveBeenCalledWith(
      mockProcessor,
      mockFrame,
      regionOptions
    );
    expect(result.current.regionColor.value).toBe('#AABBCC');
  });

  it('keeps the previous regionColor when getColorLensRegionColor returns null', () => {
    mockGetColorLensRegionColor.mockReturnValueOnce('#AABBCC').mockReturnValueOnce(null);

    const { result } = renderHook(() => useColorLensRegion());

    act(() => {
      result.current.applyColorLensRegionWorklet(mockFrame, regionOptions);
    });
    act(() => {
      result.current.applyColorLensRegionWorklet(mockFrame, regionOptions);
    });

    expect(result.current.regionColor.value).toBe('#AABBCC');
  });
});
