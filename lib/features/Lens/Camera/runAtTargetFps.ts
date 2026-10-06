declare global {
  // eslint-disable-next-line no-var
  var __frameProcessorRunAtTargetFpsMap: Record<string, number> | undefined;
}

/**
 * Throttles a frame-worklet callback to approximately `fps` invocations per second.
 * Mirrors Vision Camera v4's `runAtTargetFps` (removed in v5).
 */
export function runAtTargetFps<T>(fps: number, func: () => T): T | undefined {
  'worklet';
  const funcId = (func as { __workletHash?: string }).__workletHash ?? String(fps);
  const targetIntervalMs = 1000 / fps;
  const now = performance.now();
  const lastCall = global.__frameProcessorRunAtTargetFpsMap?.[funcId] ?? 0;
  if (now - lastCall >= targetIntervalMs) {
    if (global.__frameProcessorRunAtTargetFpsMap == null) {
      global.__frameProcessorRunAtTargetFpsMap = {};
    }
    global.__frameProcessorRunAtTargetFpsMap[funcId] = now;
    return func();
  }
  return undefined;
}
