import {
  clearLensCameraCorners,
  writeViewRectToCameraCorners,
  type LensCameraCornerSharedValues,
} from '../lensCameraCornerSharedValues';
import { useSharedValue } from 'react-native-reanimated';
import type { CameraRef } from 'react-native-vision-camera';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';

export const useLensCameraSampleRects = (
  cameraRef: React.RefObject<CameraRef | null>,
  options?: { deviceId?: string }
) => {
  const deviceId = options?.deviceId;
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Camera-space viewport corners for dominant cover-crop.
  const viewportCamX1 = useSharedValue(0);
  const viewportCamY1 = useSharedValue(0);
  const viewportCamX2 = useSharedValue(0);
  const viewportCamY2 = useSharedValue(0);
  const viewportCamX3 = useSharedValue(0);
  const viewportCamY3 = useSharedValue(0);
  const viewportCamX4 = useSharedValue(0);
  const viewportCamY4 = useSharedValue(0);
  const viewportCamReady = useSharedValue(0);

  const viewportCorners = useMemo(
    (): LensCameraCornerSharedValues => ({
      x1: viewportCamX1,
      y1: viewportCamY1,
      x2: viewportCamX2,
      y2: viewportCamY2,
      x3: viewportCamX3,
      y3: viewportCamY3,
      x4: viewportCamX4,
      y4: viewportCamY4,
      ready: viewportCamReady,
    }),
    [
      viewportCamX1,
      viewportCamY1,
      viewportCamX2,
      viewportCamY2,
      viewportCamX3,
      viewportCamY3,
      viewportCamX4,
      viewportCamY4,
      viewportCamReady,
    ]
  );

  const syncViewportCameraRect = useCallback(
    (width: number = viewportSize.width, height: number = viewportSize.height) => {
      const camera = cameraRef.current;
      if (camera === null || width <= 0 || height <= 0) {
        clearLensCameraCorners(viewportCorners);
        return;
      }

      try {
        writeViewRectToCameraCorners(
          camera,
          { x1: 0, y1: 0, x2: width, y2: height },
          viewportCorners
        );
      } catch {
        // Preview layer not ready yet — skip sampling until it is.
        clearLensCameraCorners(viewportCorners);
      }
    },
    [cameraRef, viewportCorners, viewportSize.height, viewportSize.width]
  );

  const onViewportLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setViewportSize({ width, height });
      syncViewportCameraRect(width, height);
    },
    [syncViewportCameraRect]
  );

  useEffect(() => {
    syncViewportCameraRect();
  }, [deviceId, syncViewportCameraRect]);

  return {
    viewportCorners,
    viewportWidth: viewportSize.width,
    viewportHeight: viewportSize.height,
    onViewportLayout,
    syncViewportCameraRect,
  };
};
