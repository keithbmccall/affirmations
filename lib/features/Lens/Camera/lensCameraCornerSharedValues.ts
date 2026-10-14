import type { SharedValue } from 'react-native-reanimated';
import type { CameraRef } from 'react-native-vision-camera';

export interface LensCameraCornerSharedValues {
  x1: SharedValue<number>;
  y1: SharedValue<number>;
  x2: SharedValue<number>;
  y2: SharedValue<number>;
  ready: SharedValue<number>;
}

export interface ViewRectCorners {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Mark camera-space corners as not ready (preview/layout invalid). */
export function clearLensCameraCorners(corners: LensCameraCornerSharedValues): void {
  corners.ready.value = 0;
}

/**
 * Convert opposite view-space corners to camera-space SharedValues.
 * Throws if the preview layer is not ready (`convertViewPointToCameraPoint`).
 */
export function writeViewRectToCameraCorners(
  camera: CameraRef,
  viewRect: ViewRectCorners,
  corners: LensCameraCornerSharedValues
): void {
  const corner1 = camera.convertViewPointToCameraPoint({
    x: viewRect.x1,
    y: viewRect.y1,
  });
  const corner2 = camera.convertViewPointToCameraPoint({
    x: viewRect.x2,
    y: viewRect.y2,
  });
  corners.x1.value = corner1.x;
  corners.y1.value = corner1.y;
  corners.x2.value = corner2.x;
  corners.y2.value = corner2.y;
  corners.ready.value = 1;
}
