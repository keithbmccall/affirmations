import {
  mockObskuraPhotoOutput,
  resetObskuraVisionCameraMockState,
  obskuraVisionCameraMockState,
} from '@testing/getObskuraVisionCameraJestMock';
import {
  CameraSurfaceContextForTesting,
  type CameraSurfaceContextValue,
} from '@features/Lens/Camera/CameraSurfaceContext';
import { CAMERA_VIEW_MODE } from '@features/Lens/Camera/options';
import { act, render } from '@testing-library/react-native';
import React, { createRef } from 'react';
import type { CameraDevice, CameraRef } from 'react-native-vision-camera';

import { ObskuraCameraSurface } from './ObskuraCameraSurface';
import { OBSKURA_COLOR_MODE } from './options';

jest.mock('@features/Lens/Obskura/applyObskuraLensToPhotoFile', () => ({
  applyObskuraLensToPhotoFile: jest.fn(() => Promise.resolve('file:///painted.jpg')),
}));

const mockDevice = { id: 'back' } as unknown as CameraDevice;
const mockSetChromeBindings = jest.fn();

const createMockSurfaceContext = (
  overrides: Partial<CameraSurfaceContextValue> = {}
): CameraSurfaceContextValue => ({
  cameraRef: createRef<CameraRef | null>(),
  showPreview: true,
  isActive: true,
  flashMode: 0,
  gridMode: 0,
  cameraViewMode: CAMERA_VIEW_MODE.OBSKURA,
  device: mockDevice,
  chromeBindings: null,
  setChromeBindings: mockSetChromeBindings,
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

const latestChromeBindings = () => {
  const calls = mockSetChromeBindings.mock.calls.filter(
    ([bindings]: [unknown]) => bindings !== null
  );
  return calls[calls.length - 1]?.[0] as {
    obskuraColorMode?: string;
    onObskuraColorModeToggle?: () => void;
    photoOutput?: unknown;
    processPhotoPath?: (inputPath: string) => Promise<string>;
  };
};

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

jest.mock('react-native-vision-camera-skia', () =>
  jest.requireActual('@testing/getObskuraVisionCameraJestMock').getObskuraSkiaCameraJestMock()
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
    mockSetChromeBindings.mockClear();
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

  it('creates paint for color mode and passes SkiaCamera outputs/constraints when active', () => {
    renderObskuraSurface();

    expect(mockBuildObskuraLensPaintFromPipeline).toHaveBeenCalledWith(
      [{ action: 'blur', settings: { sigma: 60 } }],
      { colorMode: OBSKURA_COLOR_MODE.DEFAULT, outputShortSidePx: 720 }
    );
    expect(obskuraVisionCameraMockState.lastCameraProps?.onFrame).toBeDefined();
    expect(obskuraVisionCameraMockState.lastCameraProps?.constraints).toEqual([
      { fps: 15 },
      { resolutionBias: mockObskuraPhotoOutput },
    ]);
    expect(obskuraVisionCameraMockState.lastCameraProps?.outputs).toEqual([
      mockObskuraPhotoOutput,
    ]);
    expect(obskuraVisionCameraMockState.lastCameraProps?.targetResolution).toEqual({
      width: 720,
      height: 1280,
    });
    expect(obskuraVisionCameraMockState.lastCameraProps?.isActive).toBe(true);
  });

  it('registers chrome bindings with photo output and Obskura color controls', () => {
    renderObskuraSurface();

    const bindings = latestChromeBindings();
    expect(bindings?.photoOutput).toBe(mockObskuraPhotoOutput);
    expect(bindings?.obskuraColorMode).toBe(OBSKURA_COLOR_MODE.DEFAULT);
    expect(bindings?.onObskuraColorModeToggle).toEqual(expect.any(Function));
    expect(bindings?.processPhotoPath).toEqual(expect.any(Function));
  });

  it('requests high-quality JPEG photo output for Skia still decoding', () => {
    const { usePhotoOutput } = jest.requireMock('react-native-vision-camera') as {
      usePhotoOutput: jest.Mock;
    };

    renderObskuraSurface();

    expect(usePhotoOutput).toHaveBeenCalledWith({
      containerFormat: 'jpeg',
      quality: 1,
      qualityPrioritization: 'quality',
    });
  });

  it('keeps onFrame when inactive (session gated by isActive)', () => {
    renderObskuraSurface({ isActive: false });

    expect(obskuraVisionCameraMockState.lastCameraProps?.isActive).toBe(false);
    expect(obskuraVisionCameraMockState.lastCameraProps?.onFrame).toBeDefined();
  });

  it('defers disposing previous paint when color mode changes', () => {
    renderObskuraSurface();

    act(() => {
      latestChromeBindings().onObskuraColorModeToggle?.();
    });

    expect(mockDispose).not.toHaveBeenCalled();
    flushDeferredSkPaintDispose();
    expect(mockDispose).toHaveBeenCalledTimes(1);
    expect(mockBuildObskuraLensPaintFromPipeline).toHaveBeenCalledWith(
      [{ action: 'blur', settings: { sigma: 60 } }],
      { colorMode: OBSKURA_COLOR_MODE.TAME_RED, outputShortSidePx: 720 }
    );
  });

  it('defers paint dispose on unmount', () => {
    const { unmount } = renderObskuraSurface();

    unmount();

    expect(mockDispose).not.toHaveBeenCalled();
    flushDeferredSkPaintDispose();
    expect(mockDispose).toHaveBeenCalledTimes(1);
    expect(mockSetChromeBindings).toHaveBeenCalledWith(null);
  });
});
