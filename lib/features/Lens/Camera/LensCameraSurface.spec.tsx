import { COLOR_LENS_MODE, type ColorLensMode } from '@features/Lens/ColorPalette/colorLensMode';
import { render } from '@testing-library/react-native';
import React, { createRef } from 'react';
import type { CameraDevice } from 'react-native-vision-camera';
import { Camera as VisionCamera } from 'react-native-vision-camera';

import {
  CameraSurfaceContextForTesting,
  type CameraSurfaceContextValue,
} from './CameraSurfaceContext';
import {
  COLOR_LENS_PALETTE_MIN_INTERVAL_MS,
  COLOR_LENS_REGION_MIN_INTERVAL_MS,
  LensCameraSurface,
} from './LensCameraSurface';
import { LENS_POINT_SAMPLE_RADIUS } from './lensPointSampleRegion';
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

jest.mock('./LensCameraTopControls', () => {
  const RN = jest.requireActual('react-native');
  return {
    LensCameraTopControls: () => <RN.View testID="mock-lens-top-controls" />,
  };
});

jest.mock('./CameraBottomControls', () => {
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
    useFrameProcessor: jest.fn((processor: (frame: unknown) => void) => {
      try {
        processor({});
      } catch {
        /* worklet body may throw outside native runtime */
      }
      return processor;
    }),
  };
});

describe('LensCameraSurface', () => {
  beforeEach(() => {
    lastCameraProps = null;
    mockColorLensMode = COLOR_LENS_MODE.DISABLED;
    jest.clearAllMocks();
  });

  it('passes frameProcessor when active', () => {
    renderLensSurface();

    expect(lastCameraProps?.frameProcessor).toBeDefined();
    expect(lastCameraProps?.fps).toBe(30);
    expect(lastCameraProps?.device).toBe(mockDevice);
    expect(lastCameraProps?.isActive).toBe(true);
  });

  it('omits frameProcessor when inactive', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;

    renderLensSurface({ isActive: false });

    expect(lastCameraProps?.frameProcessor).toBeUndefined();
  });

  it('throttles getColorLensPaletteWorklet when at least COLOR_LENS_PALETTE_MIN_INTERVAL_MS have elapsed', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_DOMINANT;
    const baseTimeMs = 1_700_000_000_000;
    let nowMs = baseTimeMs;
    const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => nowMs);

    renderLensSurface();

    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    const frameProcessor = lastCameraProps?.frameProcessor as (frame: unknown) => void;
    try {
      frameProcessor({});
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_PALETTE_MIN_INTERVAL_MS - 1;
    try {
      frameProcessor({});
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_PALETTE_MIN_INTERVAL_MS;
    try {
      frameProcessor({});
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensPaletteWorklet).toHaveBeenCalledTimes(2);

    dateNowSpy.mockRestore();
  });

  it('does not call color lens worklets when color lens mode is disabled', () => {
    renderLensSurface();

    expect(mockGetColorLensPaletteWorklet).not.toHaveBeenCalled();
    expect(mockGetColorLensRegionWorklet).not.toHaveBeenCalled();
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
      {},
      { centerX: 0.5, centerY: 0.5, radius: LENS_POINT_SAMPLE_RADIUS }
    );
  });

  it('throttles getColorLensRegionWorklet when at least COLOR_LENS_REGION_MIN_INTERVAL_MS have elapsed', () => {
    mockColorLensMode = COLOR_LENS_MODE.LENS_POINT;
    const baseTimeMs = 1_700_000_000_000;
    let nowMs = baseTimeMs;
    const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => nowMs);

    renderLensSurface();

    expect(mockGetColorLensRegionWorklet).toHaveBeenCalledTimes(1);

    const frameProcessor = lastCameraProps?.frameProcessor as (frame: unknown) => void;
    try {
      frameProcessor({});
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensRegionWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_REGION_MIN_INTERVAL_MS - 1;
    try {
      frameProcessor({});
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensRegionWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_REGION_MIN_INTERVAL_MS;
    try {
      frameProcessor({});
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(mockGetColorLensRegionWorklet).toHaveBeenCalledTimes(2);

    dateNowSpy.mockRestore();
  });
});
