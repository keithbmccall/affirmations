import type { Frame } from 'react-native-vision-camera';

/** Axis-aligned rect in raw frame pixel coordinates (top-left origin). */
export interface FrameBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Convert opposite camera-space corners to an axis-aligned frame-pixel rect.
 * Call from a frame worklet — uses `frame.convertCameraPointToFramePoint`.
 */
export function frameBoundsFromCameraCorners(
  frame: Frame,
  corner1: { x: number; y: number },
  corner2: { x: number; y: number }
): FrameBounds {
  'worklet';
  const framePoint1 = frame.convertCameraPointToFramePoint(corner1);
  const framePoint2 = frame.convertCameraPointToFramePoint(corner2);
  return {
    left: Math.min(framePoint1.x, framePoint2.x),
    right: Math.max(framePoint1.x, framePoint2.x),
    top: Math.min(framePoint1.y, framePoint2.y),
    bottom: Math.max(framePoint1.y, framePoint2.y),
  };
}
