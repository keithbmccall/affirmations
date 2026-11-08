import { COLOR_LENS_MODE, type ColorLensMode } from '@features/Lens/ColorPalette/colorLensMode';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React, { createRef } from 'react';
import type { CameraDevice, CameraPhotoOutput, CameraRef, CameraVideoOutput } from 'react-native-vision-camera';

import {
  CameraSurfaceContextForTesting,
  type CameraSurfaceContextValue,
} from './CameraSurfaceContext';
import { COLOR_LENS_PALETTE_TARGET_FPS, LensCameraSurface } from './LensCameraSurface';
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
let mockColorLensMode: ColorLensMode = COLOR_LENS_MODE.DISABLED;

const COLOR_LENS_PALETTE_MIN_INTERVAL_MS = 1000 / COLOR_LENS_PALETTE_TARGET_FPS;

const mockCapturePhotoToFile = jest.fn(() =>
  Promise.resolve({ filePath: '/tmp/freeze.jpg' })
);
const mockPhotoOutput = {
  id: 'photo',
  capturePhotoToFile: mockCapturePhotoToFile,
} as unknown as CameraPhotoOutput;
const mockVideoOutput = { id: 'video' } as unknown as CameraVideoOutput;

const mockLoadFrozenFramePixels = jest.fn(
  async (_uri: string) => ({
    width: 100,
    height: 200,
    pixels: new Uint8Array(100 * 200 * 4).fill(128),
  })
);
const mockAverageHexFromRgbaPixels = jest.fn(
  (
    _pixels: Uint8Array,
    _imageWidth: number,
    _imageHeight: number,
    _centerX: number,
    _centerY: number
  ) => '#AABBCC'
);

jest.mock('./FrozenFrame/sampleFrozenFrameColor', () => ({
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

jest.mock('@features/Lens/ColorPalette/requestColorNames', () => ({
  requestColorNames: jest.fn(async (hexes: string[]) =>
    hexes.map(hex => ({ hex, name: 'Test', pantone: null }))
  ),
}));

jest.mock('@features/Lens/ColorPalette/toLensNamedColor', () => ({
  toLensDominantPaletteColors: jest.fn(() => ({ primaryColor: { hex: '#111111' } })),
}));

const mockDevice = { id: 'back' } as unknown as CameraDevice;

const createMockCameraRef = (): React.RefObject<CameraRef | null> => {
  const ref = createRef<CameraRef | null>();
  (ref as { current: CameraRef }).current = {
    convertViewPointToCameraPoint: ({ x, y }: { x: number; y: number }) => ({ x, y }),
    focusTo: jest.fn(() => Promise.resolve()),
  } as unknown as CameraRef;
  return ref;
};

const mockSetChromeBindings = jest.fn();

const createMockSurfaceContext = (
  overrides: Partial<CameraSurfaceContextValue> = {}
): CameraSurfaceContextValue => ({
  cameraRef: createMockCameraRef(),
  showPreview: true,
  isActive: true,
  flashMode: 0,
  gridMode: 0,
  cameraViewMode: CAMERA_VIEW_MODE.LENS,
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

const latestChromeBindings = () => {
  const calls = mockSetChromeBindings.mock.calls.filter(
    ([bindings]: [unknown]) => bindings !== null
  );
  return calls[calls.length - 1]?.[0] as {
    onPhotoCaptureStart?: () => unknown;
    onPhotoAssetSaved?: (asset: unknown, context?: unknown) => Promise<void>;
    photoOutput?: unknown;
    videoOutput?: unknown;
    enableVideoLongPress?: boolean;
    isFrozen?: boolean;
    onFreezeToggle?: () => void | Promise<void>;
    onFrozenTap?: (x: number, y: number) => void;
  };
};

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
    usePhotoOutput: jest.fn(() => mockPhotoOutput),
    useVideoOutput: jest.fn(() => mockVideoOutput),
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

const expectedViewportRect = (width: number, height: number) => ({
  left: 0,
  top: 0,
  right: width,
  bottom: height,
});

describe('LensCameraSurface', () => {
  beforeEach(() => {
    lastCameraProps = null;
    lastOnFrame = undefined;
    mockColorLensMode = COLOR_LENS_MODE.DISABLED;
    global.__frameProcessorRunAtTargetFpsMap = undefined;
    jest.spyOn(performance, 'now').mockReturnValue(10_000);
    jest.clearAllMocks();
    mockSetChromeBindings.mockClear();
    mockCapturePhotoToFile.mockResolvedValue({ filePath: '/tmp/freeze.jpg' });
    mockLoadFrozenFramePixels.mockResolvedValue({
      width: 100,
      height: 200,
      pixels: new Uint8Array(100 * 200 * 4).fill(128),
    });
    mockAverageHexFromRgbaPixels.mockReturnValue('#AABBCC');
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

  it('registers chrome bindings with photo and video outputs', () => {
    renderLensSurface();

    const bindings = latestChromeBindings();
    expect(bindings?.photoOutput).toBe(mockPhotoOutput);
    expect(bindings?.videoOutput).toBe(mockVideoOutput);
    expect(bindings?.enableVideoLongPress).toBe(true);
  });

  it('configures frame output for upright preview-sized yuv buffers', () => {
    const { useFrameOutput } = jest.requireMock('react-native-vision-camera') as {
      useFrameOutput: jest.Mock;
    };
    renderLensSurface();

    expect(useFrameOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        pixelFormat: 'yuv',
        enablePreviewSizedOutputBuffers: true,
        enablePhysicalBufferRotation: true,
        onFrame: expect.any(Function),
      })
    );
  });

  it('passes isActive false to the camera when the session is inactive', () => {
    renderLensSurface({ isActive: false });

    expect(lastCameraProps?.isActive).toBe(false);
  });

  it('registers freeze chrome bindings and gates isActive when frozen', async () => {
    const surface = renderLensSurface();

    const bindings = latestChromeBindings();
    expect(bindings?.isFrozen).toBe(false);
    expect(bindings?.onFreezeToggle).toEqual(expect.any(Function));
    expect(bindings?.onFrozenTap).toBeUndefined();
    expect(lastCameraProps?.isActive).toBe(true);

    await act(async () => {
      await bindings?.onFreezeToggle?.();
    });

    expect(mockCapturePhotoToFile).toHaveBeenCalled();
    expect(mockLoadFrozenFramePixels).toHaveBeenCalledWith('file:///tmp/freeze.jpg');
    expect(latestChromeBindings()?.isFrozen).toBe(true);
    expect(latestChromeBindings()?.onFrozenTap).toEqual(expect.any(Function));
    expect(lastCameraProps?.isActive).toBe(false);
    expect(surface.getByTestId('lens-freeze-frame-overlay')).toBeTruthy();

    await act(async () => {
      await latestChromeBindings()?.onFreezeToggle?.();
    });

    expect(latestChromeBindings()?.isFrozen).toBe(false);
    expect(latestChromeBindings()?.onFrozenTap).toBeUndefined();
    expect(lastCameraProps?.isActive).toBe(true);
    expect(surface.queryByTestId('lens-freeze-frame-overlay')).toBeNull();
  });

  it('keeps isActive false when frozen while the session is inactive', async () => {
    renderLensSurface({ isActive: false });

    await act(async () => {
      await latestChromeBindings()?.onFreezeToggle?.();
    });

    expect(lastCameraProps?.isActive).toBe(false);
  });

  it('samples a frozen tap into the temporary color indicator', async () => {
    const surface = renderLensSurface();
    layoutViewport(surface);

    await act(async () => {
      await latestChromeBindings()?.onFreezeToggle?.();
    });

    act(() => {
      latestChromeBindings()?.onFrozenTap?.(120, 240);
    });

    expect(mockAverageHexFromRgbaPixels).toHaveBeenCalled();
    expect(surface.getByTestId('lens-frozen-tap-color-indicator')).toBeTruthy();

    await act(async () => {
      await latestChromeBindings()?.onFreezeToggle?.();
    });

    expect(surface.queryByTestId('lens-frozen-tap-color-indicator')).toBeNull();
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

    const surface = renderLensSurface();
    layoutViewport(surface);

    const onFrame = lastOnFrame as (frame: MockFrame) => void;
    try {
      onFrame(createMockFrame());
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

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
    const surface = renderLensSurface();
    layoutViewport(surface);

    expect(mockGetColorLensPaletteWorklet).not.toHaveBeenCalled();
  });

  it('passes resizeMode cover to the camera', () => {
    renderLensSurface();

    expect(lastCameraProps?.resizeMode).toBe('cover');
  });

  it('calls getColorLensPaletteWorklet with viewport frame rect in lens-dominant mode', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;
    const width = 390;
    const height = 844;

    const surface = renderLensSurface();
    layoutViewport(surface, width, height);

    const onFrame = lastOnFrame as (frame: MockFrame) => void;
    try {
      onFrame(createMockFrame());
    } catch {
      /* worklet body may throw outside native runtime */
    }

    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledWith(
      expect.objectContaining({
        dispose: expect.any(Function),
        convertCameraPointToFramePoint: expect.any(Function),
      }),
      expectedViewportRect(width, height)
    );
  });

  it('disposes the camera frame after palette sampling in lens-dominant mode', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;
    const order: string[] = [];
    const frame = createMockFrame();
    frame.dispose = jest.fn(() => {
      order.push('frameDispose');
    });
    mockGetColorLensPaletteWorklet.mockImplementation(() => {
      order.push('palette');
    });

    const surface = renderLensSurface();
    layoutViewport(surface);

    const onFrame = lastOnFrame as (frame: MockFrame) => void;
    try {
      onFrame(frame);
    } catch {
      /* worklet body may throw outside native runtime */
    }

    expect(order).toEqual(['palette', 'frameDispose']);
  });

  it('skips dominant sampling until the viewport camera rect is ready', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;

    renderLensSurface({
      cameraRef: createRef<CameraRef | null>(),
    });

    expect(mockGetColorLensPaletteWorklet).not.toHaveBeenCalled();
  });

  it('keeps constant fps constraints when color lens mode is active', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;

    renderLensSurface();

    expect(lastCameraProps?.constraints).toEqual([{ fps: 30 }]);
  });

  it('saves dominant palette via onPhotoAssetSaved', async () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;
    renderLensSurface();

    const bindings = latestChromeBindings();
    const context = bindings.onPhotoCaptureStart?.();
    await bindings.onPhotoAssetSaved?.(
      { id: 'asset-1', uri: 'file:///asset', mediaType: 'image' },
      context
    );

    await waitFor(() => {
      expect(mockOnAddLensPalette).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'asset-1',
          type: COLOR_LENS_MODE.LENS_DOMINANT,
        })
      );
    });
  });

  it('skips palette save when color lens is disabled', async () => {
    mockColorLensMode = COLOR_LENS_MODE.DISABLED;
    renderLensSurface();

    const bindings = latestChromeBindings();
    const context = bindings.onPhotoCaptureStart?.();
    await bindings.onPhotoAssetSaved?.(
      { id: 'asset-1', uri: 'file:///asset', mediaType: 'image' },
      context
    );

    expect(mockOnAddLensPalette).not.toHaveBeenCalled();
  });

  it('clears chrome bindings on unmount', () => {
    const { unmount } = renderLensSurface();

    unmount();

    expect(mockSetChromeBindings).toHaveBeenCalledWith(null);
  });
});
