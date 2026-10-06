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

export const mockObskuraPhotoOutput = { id: 'mock-photo-output' };

export function getObskuraVisionCameraJestMock() {
  return {
    Camera: MockCamera,
    CommonResolutions: {
      FHD_16_9: { width: 1080, height: 1920 },
      HD_16_9: { width: 720, height: 1280 },
      UHD_4_3: { width: 3000, height: 4000 },
    },
    useCameraDevice: jest.fn(() => ({ id: 'mock-device' })),
    usePhotoOutput: jest.fn(() => mockObskuraPhotoOutput),
    useVideoOutput: jest.fn(() => ({ id: 'mock-video-output' })),
    useFrameOutput: jest.fn(() => ({ id: 'mock-frame-output' })),
  };
}

export function getObskuraSkiaCameraJestMock() {
  return {
    SkiaCamera: MockCamera,
  };
}
