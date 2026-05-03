/** Pure swipe math shared with Reanimated worklets (must stay worklet-safe). */

export function clampTranslateX(
  gestureStartX: number,
  translationX: number,
  leftEdge: number,
  rightEdge: number
): number {
  'worklet';
  return Math.max(Math.min(gestureStartX + translationX, rightEdge), leftEdge);
}

export function resolveSwipePositionOnEnd(params: {
  translateX: number;
  gestureStartX: number;
  leftEdge: number;
  rightEdge: number;
}): { targetX: number; shouldBeOpen: boolean } {
  'worklet';
  const { translateX, gestureStartX, leftEdge, rightEdge } = params;
  const wasOpen = gestureStartX === leftEdge;
  if (wasOpen) {
    if (translateX > -120) {
      return { targetX: rightEdge, shouldBeOpen: false };
    }
    return { targetX: leftEdge, shouldBeOpen: true };
  }
  if (translateX < -40) {
    return { targetX: leftEdge, shouldBeOpen: true };
  }
  return { targetX: rightEdge, shouldBeOpen: false };
}
