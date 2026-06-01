import React, { forwardRef } from 'react';
import { View } from 'react-native';

export const obskuraVisionCameraMockState = {
  lastCameraProps: null as Record<string, unknown> | null,
};

export function resetObskuraVisionCameraMockState() {
  obskuraVisionCameraMockState.lastCameraProps = null;
}

const MockCamera = forwardRef<unknown, Record<string, unknown>>((props, _ref) => {
  obskuraVisionCameraMockState.lastCameraProps = props;
  return React.createElement(View, { testID: 'mock-obskura-camera' });
});

export function getObskuraVisionCameraJestMock() {
  return {
    Camera: MockCamera,
    useSkiaFrameProcessor: jest.fn(
      (processor: (frame: { render: (p: unknown) => void }) => void) => {
        try {
          processor({ render: jest.fn() });
        } catch {
          /* worklet body may throw outside native runtime */
        }
        return processor;
      }
    ),
  };
}
