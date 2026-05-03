import { calculateFps, timerModeOptions } from '@features/lens/camera/camera-options';

describe('camera-options.ts', () => {
  it('exports timerModeOptions and branches in calculateFps', () => {
    expect(timerModeOptions.length).toBeGreaterThan(0);
    expect(calculateFps({ isCameraActive: true, isColorLensEnabled: true })).toBe(15);
    expect(calculateFps({ isCameraActive: true, isColorLensEnabled: false })).toBe(30);
    expect(calculateFps({ isCameraActive: false, isColorLensEnabled: true })).toBe(30);
    expect(calculateFps({ isCameraActive: false, isColorLensEnabled: false })).toBe(30);
  });
});
