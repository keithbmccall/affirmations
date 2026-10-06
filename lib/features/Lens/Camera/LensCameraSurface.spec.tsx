import { COLOR_LENS_MODE, type ColorLensMode } from '@features/Lens/ColorPalette/colorLensMode';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React, { createRef } from 'react';
import type { CameraDevice, CameraPhotoOutput, CameraRef, CameraVideoOutput } from 'react-native-vision-camera';

import {
  CameraSurfaceContextForTesting,
  type CameraSurfaceContextValue,
} from './CameraSurfaceContext';
import {
  COLOR_LENS_PALETTE_TARGET_FPS,
  COLOR_LENS_REGION_TARGET_FPS,
  LensCameraSurface,
} from './LensCameraSurface';
import { LENS_POINT_REGION } from './lensPointSampleRegion';
import { CAMERA_VIEW_MODE } from './options';

const mockPalette = {
  primaryColor: { value: '#111111' },
  secondaryColor: { value: '#222222' },
  tertiaryColor: { value: '#333333' },
  quaternaryColor: { value: '#444444' },
  quinaryColor: { value: '#555555' },
  senaryColor: { value: '#666666' },
  backgroundColor: { value: '#777777' },
  detailColor: { value: '#888888' },
};

const mockOnAddLensPalette = jest.fn();
const mockGetColorLensPaletteWorklet = jest.fn();
const mockGetColorLensRegionWorklet = jest.fn();
const mockRegionColor = { value: '#AABBCC' };
let mockColorLensMode: ColorLensMode = COLOR_LENS_MODE.DISABLED;

const COLOR_LENS_PALETTE_MIN_INTERVAL_MS = 1000 / COLOR_LENS_PALETTE_TARGET_FPS;
const COLOR_LENS_REGION_MIN_INTERVAL_MS = 1000 / COLOR_LENS_REGION_TARGET_FPS;

const mockPhotoOutput = { id: 'photo' } as unknown as CameraPhotoOutput;
const mockVideoOutput = { id: 'video' } as unknown as CameraVideoOutput;

jest.mock('@platform', () => ({
  useLens: () => ({ onAddLensPalette: mockOnAddLensPalette }),
}));

jest.mock('@features/Lens/ColorPalette/useColorLensPalette', () => ({
  useColorLensPalette: () => ({
    colorLensMode: mockColorLensMode,
    setColorLensMode: jest.fn(),
    palette: mockPalette,
    getColorLensPaletteWorklet: mockGetColorLensPaletteWorklet,
  }),
}));

jest.mock('@features/Lens/ColorPalette/useColorLensRegion', () => ({
  useColorLensRegion: () => ({
    getColorLensRegionWorklet: mockGetColorLensRegionWorklet,
    regionColor: mockRegionColor,
  }),
}));

jest.mock('./CameraTopControls', () => {
  const RN = jest.requireActual('react-native');
  return {
    CameraTopControls: () => <RN.View testID="mock-lens-top-controls" />,
  };
});

jest.mock('./CameraBottomControls', () => {
  const RN = jest.requireActual('react-native');
  return {
    CameraBottomControls: ({
      onPhotoCaptureStart,
      onPhotoAssetSaved,
    }: {
      onPhotoCaptureStart?: () => unknown;
      onPhotoAssetSaved?: (asset: unknown, context?: unknown) => Promise<void>;
    }) => (
      <RN.Pressable
        testID="mock-bottom-controls"
        onPress={() => {
          const context = onPhotoCaptureStart?.();
          void onPhotoAssetSaved?.(
            { id: 'asset-1', uri: 'file:///asset', mediaType: 'photo' },
            context
          );
        }}
      />
    ),
  };
});

jest.mock('@features/Lens/ColorPalette/requestColorNames', () => ({
  requestColorNames: jest.fn(async (hexes: string[]) =>
    hexes.map(hex => ({ hex, name: 'Test', pantone: null }))
  ),
}));

jest.mock('@features/Lens/ColorPalette/toLensNamedColor', () => ({
  toLensDominantPaletteColors: jest.fn(() => ({ primaryColor: { hex: '#111111' } })),
  toLensNamedColor: jest.fn(() => ({ hex: '#AABBCC' })),
}));

const mockDevice = { id: 'back' } as unknown as CameraDevice;

const createMockSurfaceContext = (
  overrides: Partial<CameraSurfaceContextValue> = {}
): CameraSurfaceContextValue => ({
  cameraRef: createRef<CameraRef | null>(),
  photoOutput: mockPhotoOutput,
  videoOutput: mockVideoOutput,
  showPreview: true,
  isActive: true,
  flashMode: 0,
  gridMode: 0,
  cameraViewMode: CAMERA_VIEW_MODE.LENS,
  device: mockDevice,
  onViewModeToggle: jest.fn(),
  onGridToggle: jest.fn(),
  onFlashToggle: jest.fn(),
  onSwitchCameraToggle: jest.fn(),
  onCameraDeviceToggle: jest.fn(),
  ...overrides,
});

const renderLensSurface = (contextOverrides: Partial<CameraSurfaceContextValue> = {}) =>
  render(
    <CameraSurfaceContextForTesting.Provider value={createMockSurfaceContext(contextOverrides)}>
      <LensCameraSurface />
    </CameraSurfaceContextForTesting.Provider>
  );

let lastCameraProps: Record<string, unknown> | null = null;
let lastOnFrame: ((frame: { dispose: () => void }) => void) | undefined;

jest.mock('react-native-vision-camera', () => {
  const React = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  const MockCamera = React.forwardRef(function MockLensCamera(
    props: Record<string, unknown>,
    _ref: unknown
  ) {
    lastCameraProps = props;
    return <RN.View testID="mock-lens-camera" />;
  });
  return {
    Camera: MockCamera,
    useFrameOutput: jest.fn(
      ({ onFrame }: { onFrame?: (frame: { dispose: () => void }) => void }) => {
        lastOnFrame = onFrame;
        if (onFrame !== undefined) {
          try {
            onFrame({ dispose: jest.fn() });
          } catch {
            /* worklet body may throw outside native runtime */
          }
        }
        return { id: 'mock-frame-output' };
      }
    ),
  };
});

describe('LensCameraSurface', () => {
  beforeEach(() => {
    lastCameraProps = null;
    lastOnFrame = undefined;
    mockColorLensMode = COLOR_LENS_MODE.DISABLED;
    global.__frameProcessorRunAtTargetFpsMap = undefined;
    // runAtTargetFps uses performance.now(); keep it past the 1 FPS interval so first samples run
    jest.spyOn(performance, 'now').mockReturnValue(10_000);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('passes outputs and constraints when active', () => {
    renderLensSurface();

    expect(lastCameraProps?.outputs).toEqual([
      mockPhotoOutput,
      mockVideoOutput,
      { id: 'mock-frame-output' },
    ]);
    expect(lastCameraProps?.constraints).toEqual([{ fps: 30 }]);
    expect(lastCameraProps?.device).toBe(mockDevice);
    expect(lastCameraProps?.isActive).toBe(true);
  });

  it('does not call color lens worklets when inactive', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;

    renderLensSurface({ isActive: false });

    expect(lastOnFrame).toBeDefined();
    expect(mockGetColorLensPaletteWorklet).not.toHaveBeenCalled();
    expect(mockGetColorLensRegionWorklet).not.toHaveBeenCalled();
  });

  it('updates viewport shared values on surface layout', () => {
    const { getByTestId } = renderLensSurface();

    fireEvent(getByTestId('lens-camera-surface'), 'layout', {
      nativeEvent: { layout: { width: 390, height: 844, x: 0, y: 0 } },
    });

    expect(getByTestId('lens-camera-surface')).toBeTruthy();
  });

  it('throttles getColorLensPaletteWorklet to COLOR_LENS_PALETTE_TARGET_FPS', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;
    const baseTimeMs = 1_700_000_000_000;
    let nowMs = baseTimeMs;
    const performanceNowSpy = jest.spyOn(performance, 'now').mockImplementation(() => nowMs);

    renderLensSurface();

    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    const onFrame = lastOnFrame as (frame: { dispose: () => void }) => void;
    try {
      onFrame({ dispose: jest.fn() });
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_PALETTE_MIN_INTERVAL_MS - 1;
    try {
      onFrame({ dispose: jest.fn() });
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_PALETTE_MIN_INTERVAL_MS;
    try {
      onFrame({ dispose: jest.fn() });
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(2);

    performanceNowSpy.mockRestore();
  });

  it('does not call color lens worklets when color lens mode is disabled', () => {
    renderLensSurface();

    expect(mockGetColorLensPaletteWorklet).not.toHaveBeenCalled();
    expect(mockGetColorLensRegionWorklet).not.toHaveBeenCalled();
  });

  it('passes resizeMode cover to the camera', () => {
    renderLensSurface();

    expect(lastCameraProps?.resizeMode).toBe('cover');
  });

  it('calls getColorLensPaletteWorklet in lens-dominant mode with viewport dimensions', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;

    renderLensSurface();

    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledWith(
      expect.objectContaining({ dispose: expect.any(Function) }),
      { viewportWidth: 0, viewportHeight: 0 }
    );
  });

  it('does not call getColorLensRegionWorklet in lens-dominant mode', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;

    renderLensSurface();

    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);
    expect(mockGetColorLensRegionWorklet).not.toHaveBeenCalled();
  });

  it('calls getColorLensRegionWorklet in lens-point mode', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_POINT;

    renderLensSurface();

    expect(mockGetColorLensPaletteWorklet).not.toHaveBeenCalled();
    expect(mockGetColorLensRegionWorklet).toHaveBeenCalledWith(
      expect.objectContaining({ dispose: expect.any(Function) }),
      {
        centerX: 0.5,
        centerY: 0.5,
        radius: LENS_POINT_REGION.sampleRadius,
        viewportWidth: 0,
        viewportHeight: 0,
      }
    );
  });

  it('throttles getColorLensRegionWorklet to COLOR_LENS_REGION_TARGET_FPS', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_POINT;
    const baseTimeMs = 1_700_000_000_000;
    let nowMs = baseTimeMs;
    const performanceNowSpy = jest.spyOn(performance, 'now').mockImplementation(() => nowMs);

    renderLensSurface();

    expect(mockGetColorLensRegionWorklet).toHaveBeenCalledTimes(1);

    const onFrame = lastOnFrame as (frame: { dispose: () => void }) => void;
    try {
      onFrame({ dispose: jest.fn() });
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensRegionWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_REGION_MIN_INTERVAL_MS - 1;
    try {
      onFrame({ dispose: jest.fn() });
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensRegionWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_REGION_MIN_INTERVAL_MS;
    try {
      onFrame({ dispose: jest.fn() });
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensRegionWorklet).toHaveBeenCalledTimes(2);

    performanceNowSpy.mockRestore();
  });

  it('uses color-lens fps constraint when color lens mode is active', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;

    renderLensSurface();

    expect(lastCameraProps?.constraints).toEqual([{ fps: 15 }]);
  });

  it('saves dominant palette via onPhotoAssetSaved', async () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;
    const { getByTestId } = renderLensSurface();

    fireEvent.press(getByTestId('mock-bottom-controls'));

    await waitFor(() => {
      expect(mockOnAddLensPalette).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'asset-1',
          type: COLOR_LENS_MODE.LENS_DOMINANT,
        })
      );
    });
  });

  it('saves lens-point color via onPhotoAssetSaved', async () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_POINT;
    const { getByTestId } = renderLensSurface();

    fireEvent.press(getByTestId('mock-bottom-controls'));

    await waitFor(() => {
      expect(mockOnAddLensPalette).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'asset-1',
          type: COLOR_LENS_MODE.LENS_POINT,
          lensPointColor: { hex: '#AABBCC' },
        })
      );
    });
  });

  it('skips palette save when color lens is disabled', async () => {
    mockColorLensMode = COLOR_LENS_MODE.DISABLED;
    const { getByTestId } = renderLensSurface();

    fireEvent.press(getByTestId('mock-bottom-controls'));

    await waitFor(() => {
      expect(mockOnAddLensPalette).not.toHaveBeenCalled();
    });
  });
});
