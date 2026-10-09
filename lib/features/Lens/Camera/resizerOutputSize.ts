const RESIZER_LONG_SIDE = 128;

/** Viewport-aspect cover target for vision-camera-resizer (long side capped). */
export function getResizerOutputSize(
  viewportWidth: number,
  viewportHeight: number
): { width: number; height: number } {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return { width: RESIZER_LONG_SIDE, height: RESIZER_LONG_SIDE };
  }

  if (viewportWidth >= viewportHeight) {
    return {
      width: RESIZER_LONG_SIDE,
      height: Math.max(1, Math.round((RESIZER_LONG_SIDE * viewportHeight) / viewportWidth)),
    };
  }

  return {
    width: Math.max(1, Math.round((RESIZER_LONG_SIDE * viewportWidth) / viewportHeight)),
    height: RESIZER_LONG_SIDE,
  };
}
