jest.mock('react-native-vision-camera', () => ({
  VisionCameraProxy: {
    initFrameProcessorPlugin: jest.fn(() => null),
  },
}));

import { getColorLensPalette } from '@features/lens/lens-palette/get-color-lens-palette';

describe('get-color-lens-palette.ts', () => {
  it('throws when the native frame processor plugin is not registered', () => {
    expect(() => getColorLensPalette({} as never)).toThrow('Failed to load Frame Processor Plugin!');
  });
});
