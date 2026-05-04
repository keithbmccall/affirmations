import React, { forwardRef } from 'react';
import { View } from 'react-native';

export const skiaVisionCameraMockState = {
  lastCameraProps: null as Record<string, unknown> | null,
};

export function resetSkiaVisionCameraMockState() {
  skiaVisionCameraMockState.lastCameraProps = null;
}

const MockCamera = forwardRef<unknown, Record<string, unknown>>((props, _ref) => {
  skiaVisionCameraMockState.lastCameraProps = props;
  return React.createElement(View, { testID: 'mock-skia-camera' });
});

export function getSkiaVisionCameraJestMock() {
  return {
    Camera: MockCamera,
    useSkiaFrameProcessor: jest.fn((processor: (frame: { render: (p: unknown) => void }) => void) => {
      try {
        processor({ render: jest.fn() });
      } catch {
        /* worklet body may throw outside native runtime */
      }
      return processor;
    }),
  };
}
