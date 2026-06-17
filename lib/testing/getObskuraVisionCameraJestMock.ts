import React, { forwardRef } from 'react';
import { View } from 'react-native';

export const obskuraVisionCameraMockState = {
  lastCameraProps: null as Record<string, unknown> | null,
};

export function resetObskuraVisionCameraMockState() {
  obskuraVisionCameraMockState.lastCameraProps = null;
}

const MockCamera = forwardRef<unknown, Record<string, unknown>>(function MockObskuraCamera(
  props,
  _ref
) {
  obskuraVisionCameraMockState.lastCameraProps = props;
  return React.createElement(View, { testID: 'mock-obskura-camera' });
});

export const mockObskuraFrameProcessingFormat = {
  videoWidth: 1080,
  videoHeight: 720,
  photoWidth: 4032,
  photoHeight: 3024,
  minFps: 1,
  maxFps: 30,
};

export function getObskuraVisionCameraJestMock() {
  return {
    Camera: MockCamera,
    Templates: {
      FrameProcessing: [{ videoResolution: { width: 1080, height: 720 } }],
    },
    useCameraFormat: jest.fn(() => mockObskuraFrameProcessingFormat),
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
