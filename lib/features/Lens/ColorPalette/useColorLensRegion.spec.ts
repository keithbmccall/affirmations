import { act, renderHook } from '@testing-library/react-native';
import type { Frame } from 'react-native-vision-camera';

import { lensPaletteConfig } from './lensPaletteConfig';
import { useColorLensRegion } from './useColorLensRegion';

const mockGetColorLensRegion = jest.fn();

jest.mock('./getColorLensRegion', () => ({
  getColorLensRegion: (...args: unknown[]) => mockGetColorLensRegion(...args),
}));

jest.mock('react-native-worklets-core', () => ({
  Worklets: {
    createRunOnJS: (fn: (color: string | null) => void) => fn,
  },
}));

const mockFrame = {} as Frame;

const regionOptions = {
  centerX: 0.5,
  centerY: 0.5,
  radius: 0.15,
};

describe('useColorLensRegion', () => {
  beforeEach(() => {
    mockGetColorLensRegion.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns regionColor initialized to the default palette color', () => {
    const { result } = renderHook(() => useColorLensRegion());

    expect(result.current.regionColor.value).toBe(lensPaletteConfig.defaultColor);
  });

  it('updates regionColor when getColorLensRegionWorklet receives a color', () => {
    mockGetColorLensRegion.mockReturnValue('#AABBCC');

    const { result } = renderHook(() => useColorLensRegion());

    act(() => {
      result.current.getColorLensRegionWorklet(mockFrame, regionOptions);
    });

    expect(mockGetColorLensRegion).toHaveBeenCalledWith(mockFrame, regionOptions);
    expect(result.current.regionColor.value).toBe('#AABBCC');
    expect(console.log).toHaveBeenCalledWith('[ColorLensRegion]', '#AABBCC');
  });

  it('keeps the previous regionColor when getColorLensRegion returns null', () => {
    mockGetColorLensRegion.mockReturnValueOnce('#AABBCC').mockReturnValueOnce(null);

    const { result } = renderHook(() => useColorLensRegion());

    act(() => {
      result.current.getColorLensRegionWorklet(mockFrame, regionOptions);
    });
    act(() => {
      result.current.getColorLensRegionWorklet(mockFrame, regionOptions);
    });

    expect(result.current.regionColor.value).toBe('#AABBCC');
  });
});
