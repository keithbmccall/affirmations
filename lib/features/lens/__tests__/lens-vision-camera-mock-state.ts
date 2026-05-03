/* Test-only: read by jest.mock factory for react-native-vision-camera (hoisting-safe). */
export const lensVisionCameraMockState = {
  useCameraDevice: jest.fn(() => ({ id: 'mock-back-device' })),
  useCameraPermission: jest.fn(() => ({
    hasPermission: true,
    requestPermission: jest.fn(async () => {}),
  })),
  useMicrophonePermission: jest.fn(() => ({
    hasPermission: true,
    requestPermission: jest.fn(async () => {}),
  })),
  useFrameProcessor: jest.fn((fn: (frame: unknown) => void) => {
    lensVisionCameraMockState.lastFrameProcessor = fn;
    return fn;
  }),
  lastFrameProcessor: null as null | ((frame: unknown) => void),
  initFrameProcessorPlugin: jest.fn(() => ({
    call: jest.fn(() => ({
      primary: '#111111',
      secondary: '#222222',
      tertiary: '#333333',
      quaternary: '#444444',
      quinary: '#555555',
      senary: '#666666',
      background: '#777777',
      detail: '#888888',
    })),
  })),
  takePhoto: jest.fn(),
  startRecording: jest.fn(),
  stopRecording: jest.fn(),
  focus: jest.fn(),
};
