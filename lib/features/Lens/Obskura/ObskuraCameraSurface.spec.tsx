import {
  mockObskuraFrameProcessingFormat,
  resetObskuraVisionCameraMockState,
  obskuraVisionCameraMockState,
} from '@testing/getObskuraVisionCameraJestMock';
import { render } from '@testing-library/react-native';
import React, { createRef } from 'react';
import type { CameraDevice } from 'react-native-vision-camera';
import { Camera as VisionCamera } from 'react-native-vision-camera';
import { ObskuraCameraSurface } from './ObskuraCameraSurface';
import { OBSKURA_COLOR_MODE } from './options';

const mockDispose = jest.fn();
const mockCreateObskuraLensPaint = jest.fn((_colorMode: unknown) => ({ dispose: mockDispose }));

jest.mock('@features/Lens/Obskura/createObskuraLensPaint', () => ({
  createObskuraLensPaint: (colorMode: unknown) => mockCreateObskuraLensPaint(colorMode),
}));

jest.mock('react-native-vision-camera', () =>
  jest.requireActual('@testing/getObskuraVisionCameraJestMock').getObskuraVisionCameraJestMock()
);

const mockDevice = { id: 'back' } as unknown as CameraDevice;

describe('ObskuraCameraSurface', () => {
  beforeEach(() => {
    resetObskuraVisionCameraMockState();
    mockDispose.mockClear();
    mockCreateObskuraLensPaint.mockClear();
    jest.clearAllMocks();
  });

  it('creates paint for color mode and passes frameProcessor when active', () => {
    const cameraRef = createRef<VisionCamera | null>();

    render(
      <ObskuraCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive
        fps={15}
        colorMode={OBSKURA_COLOR_MODE.DEFAULT}
      />
    );

    expect(mockCreateObskuraLensPaint).toHaveBeenCalledWith(OBSKURA_COLOR_MODE.DEFAULT);
    expect(obskuraVisionCameraMockState.lastCameraProps?.frameProcessor).toBeDefined();
    expect(obskuraVisionCameraMockState.lastCameraProps?.fps).toBe(15);
    expect(obskuraVisionCameraMockState.lastCameraProps?.format).toBe(
      mockObskuraFrameProcessingFormat
    );
    expect(obskuraVisionCameraMockState.lastCameraProps?.photo).toBe(true);
    expect(obskuraVisionCameraMockState.lastCameraProps?.video).toBeUndefined();
    expect(obskuraVisionCameraMockState.lastCameraProps?.audio).toBeUndefined();
  });

  it('omits frameProcessor when inactive', () => {
    const cameraRef = createRef<VisionCamera | null>();

    render(
      <ObskuraCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive={false}
        fps={15}
        colorMode={OBSKURA_COLOR_MODE.TAME_RED}
      />
    );

    expect(obskuraVisionCameraMockState.lastCameraProps?.frameProcessor).toBeUndefined();
  });

  it('disposes previous paint when color mode changes', () => {
    const cameraRef = createRef<VisionCamera | null>();

    const { rerender } = render(
      <ObskuraCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive
        fps={15}
        colorMode={OBSKURA_COLOR_MODE.DEFAULT}
      />
    );

    rerender(
      <ObskuraCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive
        fps={15}
        colorMode={OBSKURA_COLOR_MODE.TAME_RED}
      />
    );

    expect(mockDispose).toHaveBeenCalledTimes(1);
    expect(mockCreateObskuraLensPaint).toHaveBeenCalledWith(OBSKURA_COLOR_MODE.TAME_RED);
  });

  it('disposes paint on unmount', () => {
    const cameraRef = createRef<VisionCamera | null>();

    const { unmount } = render(
      <ObskuraCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive
        fps={15}
        colorMode={OBSKURA_COLOR_MODE.DEFAULT}
      />
    );

    unmount();

    expect(mockDispose).toHaveBeenCalledTimes(1);
  });
});
