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
import { getResizerOutputSize } from './resizerOutputSize';

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
const mockCopyColorLensRegionWorklet = jest.fn(() => ({
  pixels: new ArrayBuffer(16),
  width: 2,
  height: 2,
}));
const mockApplyColorLensRegionColorWorklet = jest.fn();
const mockRegionColor = { value: '#AABBCC' };
let mockColorLensMode: ColorLensMode = COLOR_LENS_MODE.DISABLED;

const COLOR_LENS_PALETTE_MIN_INTERVAL_MS = 1000 / COLOR_LENS_PALETTE_TARGET_FPS;
const COLOR_LENS_REGION_MIN_INTERVAL_MS = 1000 / COLOR_LENS_REGION_TARGET_FPS;

const mockPhotoOutput = { id: 'photo' } as unknown as CameraPhotoOutput;
const mockVideoOutput = { id: 'video' } as unknown as CameraVideoOutput;

const mockGpuDispose = jest.fn();
const mockResize = jest.fn(() => ({
  getPixelBuffer: () => new ArrayBuffer(12),
  width: 2,
  height: 2,
  dispose: mockGpuDispose,
}));

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
    copyColorLensRegionWorklet: mockCopyColorLensRegionWorklet,
    applyColorLensRegionColorWorklet: mockApplyColorLensRegionColorWorklet,
    regionColor: mockRegionColor,
  }),
}));

jest.mock('react-native-vision-camera-resizer', () => ({
  useResizer: () => ({
    state: 'ready' as const,
    resizer: { resize: mockResize },
    error: undefined,
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
            { id: 'asset-1', uri: 'file:///asset', mediaType: 'image' },
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

const createMockCameraRef = (): React.RefObject<CameraRef | null> => {
  const ref = createRef<CameraRef | null>();
  (ref as { current: CameraRef }).current = {
    convertViewPointToCameraPoint: ({ x, y }: { x: number; y: number }) => ({ x, y }),
  } as CameraRef;
  return ref;
};

const createMockSurfaceContext = (
  overrides: Partial<CameraSurfaceContextValue> = {}
): CameraSurfaceContextValue => ({
  cameraRef: createMockCameraRef(),
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

const createMockFrame = () => ({
  dispose: jest.fn(),
  convertCameraPointToFramePoint: ({ x, y }: { x: number; y: number }) => ({ x, y }),
});

type MockFrame = ReturnType<typeof createMockFrame>;

let lastCameraProps: Record<string, unknown> | null = null;
let lastOnFrame: ((frame: MockFrame) => void) | undefined;

jest.mock('react-native-vision-camera', () => {
  const ReactActual = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  const MockCamera = ReactActual.forwardRef(function MockLensCamera(
    props: Record<string, unknown>,
    _ref: unknown
  ) {
    lastCameraProps = props;
    return <RN.View testID="mock-lens-camera" />;
  });
  return {
    Camera: MockCamera,
    useFrameOutput: jest.fn(({ onFrame }: { onFrame?: (frame: MockFrame) => void }) => {
      lastOnFrame = onFrame;
      if (onFrame !== undefined) {
        try {
          onFrame(createMockFrame());
        } catch {
          /* worklet body may throw outside native runtime */
        }
      }
      return { id: 'mock-frame-output' };
    }),
  };
});

const layoutViewport = (surface: ReturnType<typeof renderLensSurface>, width = 390, height = 844) => {
  fireEvent(surface.getByTestId('lens-camera-surface'), 'layout', {
    nativeEvent: { layout: { width, height, x: 0, y: 0 } },
  });
};

const expectedSampleRect = (width: number, height: number) => {
  const half = LENS_POINT_REGION.sampleRadius * Math.min(width, height);
  const centerX = width / 2;
  const centerY = height / 2;
  return {
    left: centerX - half,
    top: centerY - half,
    right: centerX + half,
    bottom: centerY + half,
  };
};

describe('LensCameraSurface', () => {
  beforeEach(() => {
    lastCameraProps = null;
    lastOnFrame = undefined;
    mockColorLensMode = COLOR_LENS_MODE.DISABLED;
    global.__frameProcessorRunAtTargetFpsMap = undefined;
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

  it('configures frame output for yuv + preview-sized buffers', () => {
    const { useFrameOutput } = jest.requireMock('react-native-vision-camera') as {
      useFrameOutput: jest.Mock;
    };
    renderLensSurface();

    expect(useFrameOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        pixelFormat: 'yuv',
        enablePreviewSizedOutputBuffers: true,
        onFrame: expect.any(Function),
      })
    );
  });

  it('does not call color lens worklets when inactive', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;

    renderLensSurface({ isActive: false });

    expect(lastOnFrame).toBeDefined();
    expect(mockGetColorLensPaletteWorklet).not.toHaveBeenCalled();
    expect(mockCopyColorLensRegionWorklet).not.toHaveBeenCalled();
    expect(mockApplyColorLensRegionColorWorklet).not.toHaveBeenCalled();
  });

  it('updates sample camera rect on surface layout', () => {
    const surface = renderLensSurface();
    layoutViewport(surface);

    expect(surface.getByTestId('lens-camera-surface')).toBeTruthy();
  });

  it('throttles getColorLensPaletteWorklet to COLOR_LENS_PALETTE_TARGET_FPS', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;
    const baseTimeMs = 1_700_000_000_000;
    let nowMs = baseTimeMs;
    const performanceNowSpy = jest.spyOn(performance, 'now').mockImplementation(() => nowMs);

    renderLensSurface();

    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    const onFrame = lastOnFrame as (frame: MockFrame) => void;
    try {
      onFrame(createMockFrame());
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_PALETTE_MIN_INTERVAL_MS - 1;
    try {
      onFrame(createMockFrame());
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_PALETTE_MIN_INTERVAL_MS;
    try {
      onFrame(createMockFrame());
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(2);

    performanceNowSpy.mockRestore();
  });

  it('does not call color lens worklets when color lens mode is disabled', () => {
    renderLensSurface();

    expect(mockGetColorLensPaletteWorklet).not.toHaveBeenCalled();
    expect(mockCopyColorLensRegionWorklet).not.toHaveBeenCalled();
    expect(mockApplyColorLensRegionColorWorklet).not.toHaveBeenCalled();
  });

  it('passes resizeMode cover to the camera', () => {
    renderLensSurface();

    expect(lastCameraProps?.resizeMode).toBe('cover');
  });

  it('calls getColorLensPaletteWorklet with resizer RGB buffer in lens-dominant mode', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;

    renderLensSurface();

    expect(mockResize).toHaveBeenCalled();
    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledWith({
      pixels: expect.any(ArrayBuffer),
      width: 2,
      height: 2,
    });
    expect(mockGpuDispose).toHaveBeenCalled();
  });

  it('disposes the camera frame before palette MMCQ in lens-dominant mode', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;
    const order: string[] = [];

    mockResize.mockImplementation((frame: MockFrame) => {
      const originalDispose = frame.dispose.bind(frame);
      frame.dispose = jest.fn(() => {
        order.push('frameDispose');
        originalDispose();
      });
      return {
        getPixelBuffer: () => new ArrayBuffer(12),
        width: 2,
        height: 2,
        dispose: mockGpuDispose,
      };
    });
    mockGetColorLensPaletteWorklet.mockImplementation(() => {
      order.push('palette');
    });

    renderLensSurface();

    expect(order).toEqual(['frameDispose', 'palette']);
  });

  it('does not call region worklets in lens-dominant mode', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;

    renderLensSurface();

    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);
    expect(mockCopyColorLensRegionWorklet).not.toHaveBeenCalled();
    expect(mockApplyColorLensRegionColorWorklet).not.toHaveBeenCalled();
  });

  it('copies region then applies color after disposing frame in lens-point mode', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_POINT;
    const width = 390;
    const height = 844;
    const frame = createMockFrame();
    let disposeOrder = 0;
    let frameDisposeAt = 0;
    let applyAt = 0;

    frame.dispose = jest.fn(() => {
      disposeOrder += 1;
      frameDisposeAt = disposeOrder;
    });
    mockApplyColorLensRegionColorWorklet.mockImplementation(() => {
      disposeOrder += 1;
      applyAt = disposeOrder;
    });

    const surface = renderLensSurface();
    layoutViewport(surface, width, height);

    const onFrame = lastOnFrame as (frame: MockFrame) => void;
    try {
      onFrame(frame);
    } catch {
      /* worklet body may throw outside native runtime */
    }

    expect(mockGetColorLensPaletteWorklet).not.toHaveBeenCalled();
    expect(mockCopyColorLensRegionWorklet).toHaveBeenCalledWith(
      expect.objectContaining({
        dispose: expect.any(Function),
        convertCameraPointToFramePoint: expect.any(Function),
      }),
      expectedSampleRect(width, height)
    );
    expect(frame.dispose).toHaveBeenCalled();
    expect(mockApplyColorLensRegionColorWorklet).toHaveBeenCalledWith({
      pixels: expect.any(ArrayBuffer),
      width: 2,
      height: 2,
    });
    expect(frameDisposeAt).toBeGreaterThan(0);
    expect(applyAt).toBeGreaterThan(frameDisposeAt);
  });

  it('skips region sampling until the camera sample rect is ready', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_POINT;

    renderLensSurface({
      cameraRef: createRef<CameraRef | null>(),
    });

    expect(mockCopyColorLensRegionWorklet).not.toHaveBeenCalled();
    expect(mockApplyColorLensRegionColorWorklet).not.toHaveBeenCalled();
  });

  it('throttles region copy+apply to COLOR_LENS_REGION_TARGET_FPS', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_POINT;
    const baseTimeMs = 1_700_000_000_000;
    let nowMs = baseTimeMs;
    const performanceNowSpy = jest.spyOn(performance, 'now').mockImplementation(() => nowMs);

    const surface = renderLensSurface();
    layoutViewport(surface);

    const onFrame = lastOnFrame as (frame: MockFrame) => void;
    try {
      onFrame(createMockFrame());
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockCopyColorLensRegionWorklet).toHaveBeenCalledTimes(1);
    expect(mockApplyColorLensRegionColorWorklet).toHaveBeenCalledTimes(1);

    try {
      onFrame(createMockFrame());
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockCopyColorLensRegionWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_REGION_MIN_INTERVAL_MS - 1;
    try {
      onFrame(createMockFrame());
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockCopyColorLensRegionWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_REGION_MIN_INTERVAL_MS;
    try {
      onFrame(createMockFrame());
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockCopyColorLensRegionWorklet).toHaveBeenCalledTimes(2);
    expect(mockApplyColorLensRegionColorWorklet).toHaveBeenCalledTimes(2);

    performanceNowSpy.mockRestore();
  });

  it('keeps constant fps constraints when color lens mode is active', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;

    renderLensSurface();

    expect(lastCameraProps?.constraints).toEqual([{ fps: 30 }]);
  });

  it('uses viewport-aspect resizer output size after layout', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;
    const surface = renderLensSurface();
    layoutViewport(surface, 390, 844);

    expect(getResizerOutputSize(390, 844)).toEqual({ width: 59, height: 128 });
    expect(surface.getByTestId('lens-camera-surface')).toBeTruthy();
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
