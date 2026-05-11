import { render } from '@testing-library/react-native';
import { Camera as VisionCamera } from 'react-native-vision-camera';
import React, { createRef } from 'react';
import { resetSkiaVisionCameraMockState, skiaVisionCameraMockState } from './getSkiaVisionCameraJestMock';
import { SKIA_COLOR_MODE } from './options';
import { SkiaCameraSurface } from './SkiaCameraSurface';
import type { CameraDevice } from 'react-native-vision-camera';


const mockDispose = jest.fn();
const mockCreateSkiaLensPaint = jest.fn((_colorMode: unknown) => ({ dispose: mockDispose }));

jest.mock('@features/Lens/Camera/createSkiaLensPaint', () => ({
  createSkiaLensPaint: (colorMode: unknown) => mockCreateSkiaLensPaint(colorMode),
}));

jest.mock('react-native-vision-camera', () =>
  jest.requireActual('./getSkiaVisionCameraJestMock').getSkiaVisionCameraJestMock()
);

const mockDevice = { id: 'back' } as unknown as CameraDevice;

describe('SkiaCameraSurface', () => {
  beforeEach(() => {
    resetSkiaVisionCameraMockState();
    mockDispose.mockClear();
    mockCreateSkiaLensPaint.mockClear();
    jest.clearAllMocks();
  });

  it('creates paint for color mode and passes frameProcessor when active', () => {
    const cameraRef = createRef<VisionCamera | null>();

    render(
      <SkiaCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive
        fps={15}
        colorMode={SKIA_COLOR_MODE.DEFAULT}
      />
    );

    expect(mockCreateSkiaLensPaint).toHaveBeenCalledWith(SKIA_COLOR_MODE.DEFAULT);
    expect(skiaVisionCameraMockState.lastCameraProps?.frameProcessor).toBeDefined();
    expect(skiaVisionCameraMockState.lastCameraProps?.fps).toBe(15);
  });

  it('omits frameProcessor when inactive', () => {
    const cameraRef = createRef<VisionCamera | null>();

    render(
      <SkiaCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive={false}
        fps={15}
        colorMode={SKIA_COLOR_MODE.TAME_RED}
      />
    );

    expect(skiaVisionCameraMockState.lastCameraProps?.frameProcessor).toBeUndefined();
  });

  it('disposes previous paint when color mode changes', () => {
    const cameraRef = createRef<VisionCamera | null>();

    const { rerender } = render(
      <SkiaCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive
        fps={15}
        colorMode={SKIA_COLOR_MODE.DEFAULT}
      />
    );

    rerender(
      <SkiaCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive
        fps={15}
        colorMode={SKIA_COLOR_MODE.TAME_RED}
      />
    );

    expect(mockDispose).toHaveBeenCalledTimes(1);
    expect(mockCreateSkiaLensPaint).toHaveBeenCalledWith(SKIA_COLOR_MODE.TAME_RED);
  });

  it('disposes paint on unmount', () => {
    const cameraRef = createRef<VisionCamera | null>();

    const { unmount } = render(
      <SkiaCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive
        fps={15}
        colorMode={SKIA_COLOR_MODE.DEFAULT}
      />
    );

    unmount();

    expect(mockDispose).toHaveBeenCalledTimes(1);
  });
});
