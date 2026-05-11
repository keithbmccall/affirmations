import { render } from '@testing-library/react-native';
import React, { createRef } from 'react';
import type { CameraDevice } from 'react-native-vision-camera';
import { Camera as VisionCamera } from 'react-native-vision-camera';

import { COLOR_LENS_PALETTE_MIN_INTERVAL_MS, LensCameraSurface } from './LensCameraSurface';

let lastCameraProps: Record<string, unknown> | null = null;

jest.mock('react-native-vision-camera', () => {
  const React = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  const MockCamera = React.forwardRef((props: Record<string, unknown>, _ref: unknown) => {
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

const mockDevice = { id: 'back' } as unknown as CameraDevice;

describe('LensCameraSurface', () => {
  beforeEach(() => {
    lastCameraProps = null;
    jest.clearAllMocks();
  });

  it('passes frameProcessor when active', () => {
    const cameraRef = createRef<VisionCamera | null>();
    const getColorLensPaletteWorklet = jest.fn();

    render(
      <LensCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive
        fps={30}
        isColorLensEnabled={false}
        getColorLensPaletteWorklet={getColorLensPaletteWorklet}
      />
    );

    expect(lastCameraProps?.frameProcessor).toBeDefined();
    expect(lastCameraProps?.fps).toBe(30);
    expect(lastCameraProps?.device).toBe(mockDevice);
    expect(lastCameraProps?.isActive).toBe(true);
  });

  it('omits frameProcessor when inactive', () => {
    const cameraRef = createRef<VisionCamera | null>();
    const getColorLensPaletteWorklet = jest.fn();

    render(
      <LensCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive={false}
        fps={15}
        isColorLensEnabled
        getColorLensPaletteWorklet={getColorLensPaletteWorklet}
      />
    );

    expect(lastCameraProps?.frameProcessor).toBeUndefined();
  });

  it('throttles getColorLensPaletteWorklet when at least COLOR_LENS_PALETTE_MIN_INTERVAL_MS have elapsed', () => {
    const baseTimeMs = 1_700_000_000_000;
    let nowMs = baseTimeMs;
    const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => nowMs);

    const cameraRef = createRef<VisionCamera | null>();
    const getColorLensPaletteWorklet = jest.fn();

    render(
      <LensCameraSurface
        cameraRef={cameraRef}
        device={mockDevice}
        isActive
        fps={30}
        isColorLensEnabled
        getColorLensPaletteWorklet={getColorLensPaletteWorklet}
      />
    );

    expect(getColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    const frameProcessor = lastCameraProps?.frameProcessor as (frame: unknown) => void;
    try {
      frameProcessor({});
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(getColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_PALETTE_MIN_INTERVAL_MS - 1;
    try {
      frameProcessor({});
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(getColorLensPaletteWorklet).toHaveBeenCalledTimes(1);

    nowMs = baseTimeMs + COLOR_LENS_PALETTE_MIN_INTERVAL_MS;
    try {
      frameProcessor({});
    } catch {
      /* worklet body may throw outside native runtime */
    }
    expect(getColorLensPaletteWorklet).toHaveBeenCalledTimes(2);

    dateNowSpy.mockRestore();
  });
});
