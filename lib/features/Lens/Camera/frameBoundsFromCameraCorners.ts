import type { Frame } from 'react-native-vision-camera';

/** Axis-aligned rect in raw frame pixel coordinates (top-left origin). */
export interface FrameBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface CameraPoint {
  x: number;
  y: number;
}

/**
 * Convert camera-space corners to an axis-aligned frame-pixel rect.
 * Call from a frame worklet — uses `frame.convertCameraPointToFramePoint`.
 * Pass all four rect corners so orientation/cover mapping cannot shrink the AABB
 * to a two-point diagonal.
 */
export function frameBoundsFromCameraCorners(
  frame: Frame,
  ...cameraCorners: CameraPoint[]
): FrameBounds {
  'worklet';
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < cameraCorners.length; index += 1) {
    const framePoint = frame.convertCameraPointToFramePoint(cameraCorners[index]);
    left = Math.min(left, framePoint.x);
    right = Math.max(right, framePoint.x);
    top = Math.min(top, framePoint.y);
    bottom = Math.max(bottom, framePoint.y);
  }

  return { left, top, right, bottom };
}
