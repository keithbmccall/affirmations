import { shouldRunAtTargetFps } from './shouldRunAtTargetFps';

describe('shouldRunAtTargetFps', () => {
  beforeEach(() => {
    global.__frameProcessorRunAtTargetFpsMap = undefined;
    jest.spyOn(performance, 'now').mockReturnValue(10_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows the first call for a key', () => {
    expect(shouldRunAtTargetFps('palette', 1)).toBe(true);
  });

  it('denies a second call before the interval elapses', () => {
    expect(shouldRunAtTargetFps('palette', 1)).toBe(true);
    jest.spyOn(performance, 'now').mockReturnValue(10_500);
    expect(shouldRunAtTargetFps('palette', 1)).toBe(false);
  });

  it('allows a call after the interval elapses', () => {
    expect(shouldRunAtTargetFps('palette', 1)).toBe(true);
    jest.spyOn(performance, 'now').mockReturnValue(11_000);
    expect(shouldRunAtTargetFps('palette', 1)).toBe(true);
  });

  it('tracks independent keys separately', () => {
    expect(shouldRunAtTargetFps('palette', 1)).toBe(true);
    expect(shouldRunAtTargetFps('region', 2)).toBe(true);
    jest.spyOn(performance, 'now').mockReturnValue(10_400);
    expect(shouldRunAtTargetFps('palette', 1)).toBe(false);
    expect(shouldRunAtTargetFps('region', 2)).toBe(false);
    jest.spyOn(performance, 'now').mockReturnValue(10_500);
    expect(shouldRunAtTargetFps('region', 2)).toBe(true);
  });
});
