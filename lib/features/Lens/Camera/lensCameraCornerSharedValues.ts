import type { SharedValue } from 'react-native-reanimated';
import type { CameraRef } from 'react-native-vision-camera';

/** Four view-rect corners in camera space (TL, TR, BR, BL) plus a ready flag. */
export interface LensCameraCornerSharedValues {
  x1: SharedValue<number>;
  y1: SharedValue<number>;
  x2: SharedValue<number>;
  y2: SharedValue<number>;
  x3: SharedValue<number>;
  y3: SharedValue<number>;
  x4: SharedValue<number>;
  y4: SharedValue<number>;
  ready: SharedValue<number>;
}

/** Axis-aligned view rect as opposite corners (top-left and bottom-right). */
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
 * Convert all four view-space rect corners to camera-space SharedValues.
 * Throws if the preview layer is not ready (`convertViewPointToCameraPoint`).
 */
export function writeViewRectToCameraCorners(
  camera: CameraRef,
  viewRect: ViewRectCorners,
  corners: LensCameraCornerSharedValues
): void {
  const topLeft = camera.convertViewPointToCameraPoint({
    x: viewRect.x1,
    y: viewRect.y1,
  });
  const topRight = camera.convertViewPointToCameraPoint({
    x: viewRect.x2,
    y: viewRect.y1,
  });
  const bottomRight = camera.convertViewPointToCameraPoint({
    x: viewRect.x2,
    y: viewRect.y2,
  });
  const bottomLeft = camera.convertViewPointToCameraPoint({
    x: viewRect.x1,
    y: viewRect.y2,
  });
  corners.x1.value = topLeft.x;
  corners.y1.value = topLeft.y;
  corners.x2.value = topRight.x;
  corners.y2.value = topRight.y;
  corners.x3.value = bottomRight.x;
  corners.y3.value = bottomRight.y;
  corners.x4.value = bottomLeft.x;
  corners.y4.value = bottomLeft.y;
  corners.ready.value = 1;
}
