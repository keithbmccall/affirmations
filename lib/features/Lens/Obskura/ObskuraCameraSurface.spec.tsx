import {
  mockObskuraFrameProcessingFormat,
  resetObskuraVisionCameraMockState,
  obskuraVisionCameraMockState,
} from '@testing/getObskuraVisionCameraJestMock';
import { CameraSurfaceContextForTesting, type CameraSurfaceContextValue } from '@features/Lens/Camera/CameraSurfaceContext';
import { CAMERA_VIEW_MODE } from '@features/Lens/Camera/options';
import { fireEvent, render } from '@testing-library/react-native';
import React, { createRef } from 'react';
import type { CameraDevice } from 'react-native-vision-camera';
import { Camera as VisionCamera } from 'react-native-vision-camera';

import { ObskuraCameraSurface } from './ObskuraCameraSurface';
import { OBSKURA_COLOR_MODE } from './options';

jest.mock('@features/Lens/Obskura/applyObskuraLensToPhotoFile', () => ({
  applyObskuraLensToPhotoFile: jest.fn(() => Promise.resolve('file:///painted.jpg')),
}));

jest.mock('@features/Lens/Obskura/ObskuraCameraTopControls', () => {
  const React = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return {
    ObskuraCameraTopControls: ({
      onObskuraColorModeToggle,
    }: {
      onObskuraColorModeToggle: () => void;
    }) => (
      <RN.Pressable
        testID="lens-control-obskura-color-mode"
        onPress={onObskuraColorModeToggle}
      />
    ),
  };
});

jest.mock('@features/Lens/Camera/CameraBottomControls', () => {
  const RN = jest.requireActual('react-native');
  return {
    CameraBottomControls: () => <RN.View testID="mock-bottom-controls" />,
  };
});

const mockDevice = { id: 'back' } as unknown as CameraDevice;

const createMockSurfaceContext = (
  overrides: Partial<CameraSurfaceContextValue> = {}
): CameraSurfaceContextValue => ({
  cameraRef: createRef<VisionCamera | null>(),
  showPreview: true,
  isActive: true,
  flashMode: 0,
  gridMode: 0,
  cameraViewMode: CAMERA_VIEW_MODE.OBSKURA,
  device: mockDevice,
  onViewModeToggle: jest.fn(),
  onGridToggle: jest.fn(),
  onFlashToggle: jest.fn(),
  onSwitchCameraToggle: jest.fn(),
  onCameraDeviceToggle: jest.fn(),
  ...overrides,
});

const renderObskuraSurface = (contextOverrides: Partial<CameraSurfaceContextValue> = {}) =>
  render(
    <CameraSurfaceContextForTesting.Provider value={createMockSurfaceContext(contextOverrides)}>
      <ObskuraCameraSurface />
    </CameraSurfaceContextForTesting.Provider>
  );

const mockDispose = jest.fn();
const mockBuildObskuraLensPaintFromPipeline = jest.fn((_pipeline: unknown, _context: unknown) => ({
  dispose: mockDispose,
}));

jest.mock('@features/Lens/Obskura/pipeline/buildObskuraLensPaintFromPipeline', () => ({
  buildObskuraLensPaintFromPipeline: (pipeline: unknown, context: unknown) =>
    mockBuildObskuraLensPaintFromPipeline(pipeline, context),
}));

jest.mock('@features/Lens/Obskura/pipeline/obskuraLensPipelineConfig', () => ({
  OBSKURA_LENS_PIPELINE: [{ action: 'blur', settings: { sigma: 60 } }],
}));

jest.mock('react-native-vision-camera', () =>
  jest.requireActual('@testing/getObskuraVisionCameraJestMock').getObskuraVisionCameraJestMock()
);

function flushDeferredSkPaintDispose() {
  jest.runOnlyPendingTimers();
  jest.runOnlyPendingTimers();
}

describe('ObskuraCameraSurface', () => {
  beforeEach(() => {
    resetObskuraVisionCameraMockState();
    mockDispose.mockClear();
    mockBuildObskuraLensPaintFromPipeline.mockClear();
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.spyOn(global, 'requestAnimationFrame').mockImplementation(callback => {
      return setTimeout(() => callback(0), 0) as unknown as number;
    });
    jest.spyOn(global, 'cancelAnimationFrame').mockImplementation(timerId => {
      clearTimeout(timerId);
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('creates paint for color mode and passes frameProcessor when active', () => {
    renderObskuraSurface();

    expect(mockBuildObskuraLensPaintFromPipeline).toHaveBeenCalledWith(
      [{ action: 'blur', settings: { sigma: 60 } }],
      { colorMode: OBSKURA_COLOR_MODE.DEFAULT }
    );
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
    renderObskuraSurface({ isActive: false });

    expect(obskuraVisionCameraMockState.lastCameraProps?.frameProcessor).toBeUndefined();
  });

  it('defers disposing previous paint when color mode changes', () => {
    const { getByTestId } = renderObskuraSurface();

    fireEvent.press(getByTestId('lens-control-obskura-color-mode'));

    expect(mockDispose).not.toHaveBeenCalled();
    flushDeferredSkPaintDispose();
    expect(mockDispose).toHaveBeenCalledTimes(1);
    expect(mockBuildObskuraLensPaintFromPipeline).toHaveBeenCalledWith(
      [{ action: 'blur', settings: { sigma: 60 } }],
      { colorMode: OBSKURA_COLOR_MODE.TAME_RED }
    );
  });

  it('defers paint dispose on unmount', () => {
    const { unmount } = renderObskuraSurface();

    unmount();

    expect(mockDispose).not.toHaveBeenCalled();
    flushDeferredSkPaintDispose();
    expect(mockDispose).toHaveBeenCalledTimes(1);
  });
});
