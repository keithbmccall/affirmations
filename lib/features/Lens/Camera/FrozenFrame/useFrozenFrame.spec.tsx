import { act, render, renderHook } from '@testing-library/react-native';
import React from 'react';
import { View } from 'react-native';
import type { CameraPhotoOutput } from 'react-native-vision-camera';
import { useFrozenFrame } from './useFrozenFrame';

const mockCapturePhotoToFile = jest.fn(() =>
  Promise.resolve({ filePath: '/tmp/freeze.jpg' })
);
const mockLoadFrozenFramePixels = jest.fn(async (_uri: string) => ({
  width: 100,
  height: 200,
  pixels: new Uint8Array(100 * 200 * 4).fill(128),
}));
const mockAverageHexFromRgbaPixels = jest.fn(
  (
    _pixels: Uint8Array,
    _imageWidth: number,
    _imageHeight: number,
    _centerX: number,
    _centerY: number
  ) => '#AABBCC'
);

jest.mock('./sampleFrozenFrameColor', () => ({
  loadFrozenFramePixels: (uri: string) => mockLoadFrozenFramePixels(uri),
  averageHexFromRgbaPixels: (
    pixels: Uint8Array,
    imageWidth: number,
    imageHeight: number,
    centerX: number,
    centerY: number
  ) => mockAverageHexFromRgbaPixels(pixels, imageWidth, imageHeight, centerX, centerY),
}));

jest.mock('expo-image', () => ({
  Image: (props: { testID?: string }) => {
    const RN = jest.requireActual('react-native');
    return <RN.View testID={props.testID ?? 'expo-image'} />;
  },
}));

const mockPhotoOutput = {
  capturePhotoToFile: mockCapturePhotoToFile,
} as unknown as CameraPhotoOutput;

describe('useFrozenFrame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCapturePhotoToFile.mockResolvedValue({ filePath: '/tmp/freeze.jpg' });
    mockLoadFrozenFramePixels.mockResolvedValue({
      width: 100,
      height: 200,
      pixels: new Uint8Array(100 * 200 * 4).fill(128),
    });
    mockAverageHexFromRgbaPixels.mockReturnValue('#AABBCC');
  });

  it('captures a still, gates the camera, and exposes an overlay while frozen', async () => {
    const { result } = renderHook(() =>
      useFrozenFrame({
        photoOutput: mockPhotoOutput,
        viewportWidth: 390,
        viewportHeight: 844,
      })
    );

    expect(result.current.isFrozen).toBe(false);
    expect(result.current.isCameraActiveGate).toBe(true);
    expect(result.current.overlay).toBeNull();

    await act(async () => {
      await result.current.onFreezeToggle();
    });

    expect(mockCapturePhotoToFile).toHaveBeenCalled();
    expect(mockLoadFrozenFramePixels).toHaveBeenCalledWith('file:///tmp/freeze.jpg');
    expect(result.current.isFrozen).toBe(true);
    expect(result.current.isCameraActiveGate).toBe(false);

    const { getByTestId, queryByTestId, rerender } = render(
      <View>{result.current.overlay}</View>
    );
    expect(getByTestId('lens-freeze-frame-overlay')).toBeTruthy();

    act(() => {
      result.current.onFrozenTap(120, 240);
    });
    rerender(<View>{result.current.overlay}</View>);

    expect(mockAverageHexFromRgbaPixels).toHaveBeenCalled();
    expect(getByTestId('lens-frozen-tap-color-indicator')).toBeTruthy();

    await act(async () => {
      await result.current.onFreezeToggle();
    });

    expect(result.current.isFrozen).toBe(false);
    expect(result.current.isCameraActiveGate).toBe(true);
    rerender(<View>{result.current.overlay}</View>);
    expect(queryByTestId('lens-freeze-frame-overlay')).toBeNull();
    expect(queryByTestId('lens-frozen-tap-color-indicator')).toBeNull();
  });

  it('no-ops tap sampling when not frozen', () => {
    const { result } = renderHook(() =>
      useFrozenFrame({
        photoOutput: mockPhotoOutput,
        viewportWidth: 390,
        viewportHeight: 844,
      })
    );

    act(() => {
      result.current.onFrozenTap(10, 20);
    });

    expect(mockAverageHexFromRgbaPixels).not.toHaveBeenCalled();
  });
});
