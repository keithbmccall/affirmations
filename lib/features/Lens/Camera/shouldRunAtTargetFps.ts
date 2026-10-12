declare global {
  // eslint-disable-next-line no-var
  var __frameProcessorRunAtTargetFpsMap: Record<string, number> | undefined;
}

/**
 * Returns whether a frame-worklet path should run at approximately `fps`.
 * Mirrors Vision Camera v4's `runAtTargetFps` throttle (removed in v5) without
 * allocating a nested worklet closure per frame.
 */
export function shouldRunAtTargetFps(key: string, fps: number): boolean {
  'worklet';
  const targetIntervalMs = 1000 / fps;
  const now = performance.now();
  const lastCall = global.__frameProcessorRunAtTargetFpsMap?.[key] ?? 0;
  if (now - lastCall >= targetIntervalMs) {
    if (global.__frameProcessorRunAtTargetFpsMap == null) {
      global.__frameProcessorRunAtTargetFpsMap = {};
    }
    global.__frameProcessorRunAtTargetFpsMap[key] = now;
    return true;
  }
  return false;
}
