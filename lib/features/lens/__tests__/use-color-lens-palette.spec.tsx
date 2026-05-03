jest.mock('react-native-worklets-core', () => ({
  Worklets: {
    createRunOnJS: <T extends (...args: unknown[]) => unknown>(fn: T) =>
      (((...args: unknown[]) => (fn as (...a: unknown[]) => unknown)(...args)) as unknown) as T,
  },
}));

jest.mock('react-native-vision-camera', () => {
  const { useColorLensPaletteVisionMockState } = require('./use-color-lens-palette-mock-state');
  return {
    VisionCameraProxy: {
      initFrameProcessorPlugin: jest.fn(() => ({
        call: jest.fn(() => useColorLensPaletteVisionMockState.pluginPalette),
      })),
    },
  };
});

import { useColorLensPalette } from '@features/lens/lens-palette/use-color-lens-palette';
import { act, renderHook } from '@testing-library/react-native';

import { useColorLensPaletteVisionMockState } from './use-color-lens-palette-mock-state';

const fullPalette = {
  primary: '#111111',
  secondary: '#222222',
  tertiary: '#333333',
  quaternary: '#444444',
  quinary: '#555555',
  senary: '#666666',
  background: '#777777',
  detail: '#888888',
};

describe('use-color-lens-palette.ts', () => {
  beforeEach(() => {
    useColorLensPaletteVisionMockState.pluginPalette = fullPalette;
  });

  it('applies palette when getColorLensPalette returns colors', () => {
    const { result } = renderHook(() => useColorLensPalette());
    act(() => {
      result.current.getColorLensPaletteWorklet({} as never);
    });
    expect(result.current.palette.primaryColor.value).toBe('#111111');
  });

  it('applies optional chaining when getColorLensPalette returns null', () => {
    useColorLensPaletteVisionMockState.pluginPalette = null;
    const { result } = renderHook(() => useColorLensPalette());
    const before = result.current.palette.primaryColor.value;
    act(() => {
      result.current.getColorLensPaletteWorklet({} as never);
    });
    expect(result.current.palette.primaryColor.value).toBe(before);
  });

  it('merges partial palette results with existing shared values', () => {
    useColorLensPaletteVisionMockState.pluginPalette = {
      primary: '#aaaaaa',
      secondary: null,
      tertiary: undefined,
      quaternary: '#bbbbbb',
      quinary: '#cccccc',
      senary: '#dddddd',
      background: '#eeeeee',
      detail: '#ffffff',
    };
    const { result } = renderHook(() => useColorLensPalette());
    act(() => {
      result.current.getColorLensPaletteWorklet({} as never);
    });
    expect(result.current.palette.primaryColor.value).toBe('#aaaaaa');
  });
});
