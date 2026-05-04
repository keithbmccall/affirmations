import { calculateFps } from './options';

describe('calculateFps', () => {
  it('returns 15 when camera active and color lens enabled', () => {
    expect(calculateFps({ isCameraActive: true, isColorLensEnabled: true })).toBe(15);
  });

  it('returns 30 when camera active and color lens disabled', () => {
    expect(calculateFps({ isCameraActive: true, isColorLensEnabled: false })).toBe(30);
  });

  it('returns 30 when camera inactive regardless of color lens', () => {
    expect(calculateFps({ isCameraActive: false, isColorLensEnabled: true })).toBe(30);
    expect(calculateFps({ isCameraActive: false, isColorLensEnabled: false })).toBe(30);
  });
});
