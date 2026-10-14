import {
  clearLensCameraCorners,
  writeViewRectToCameraCorners,
  type LensCameraCornerSharedValues,
} from '../lensCameraCornerSharedValues';
import { getLensPointSampleRect } from '../lensPointSampleRegion';
import { useSharedValue } from 'react-native-reanimated';
import type { CameraRef } from 'react-native-vision-camera';
import { useCallback, useMemo } from 'react';

export const useLensCameraSampleRects = (
  cameraRef: React.RefObject<CameraRef | null>
) => {
  // Camera-space sample square corners (JS-thread view→camera conversion).
  const sampleCamX1 = useSharedValue(0);
  const sampleCamY1 = useSharedValue(0);
  const sampleCamX2 = useSharedValue(0);
  const sampleCamY2 = useSharedValue(0);
  const sampleCamReady = useSharedValue(0);

  // Camera-space viewport corners for dominant cover-crop.
  const viewportCamX1 = useSharedValue(0);
  const viewportCamY1 = useSharedValue(0);
  const viewportCamX2 = useSharedValue(0);
  const viewportCamY2 = useSharedValue(0);
  const viewportCamReady = useSharedValue(0);

  const sampleCorners = useMemo(
    (): LensCameraCornerSharedValues => ({
      x1: sampleCamX1,
      y1: sampleCamY1,
      x2: sampleCamX2,
      y2: sampleCamY2,
      ready: sampleCamReady,
    }),
    [sampleCamX1, sampleCamY1, sampleCamX2, sampleCamY2, sampleCamReady]
  );

  const viewportCorners = useMemo(
    (): LensCameraCornerSharedValues => ({
      x1: viewportCamX1,
      y1: viewportCamY1,
      x2: viewportCamX2,
      y2: viewportCamY2,
      ready: viewportCamReady,
    }),
    [viewportCamX1, viewportCamY1, viewportCamX2, viewportCamY2, viewportCamReady]
  );

  const updateSampleCameraRect = useCallback(
    (width: number, height: number) => {
      const camera = cameraRef.current;
      if (camera === null || width <= 0 || height <= 0) {
        clearLensCameraCorners(sampleCorners);
        clearLensCameraCorners(viewportCorners);
        return;
      }

      const sampleRect = getLensPointSampleRect({ x: 0, y: 0, width, height });
      if (sampleRect.size <= 0) {
        clearLensCameraCorners(sampleCorners);
        clearLensCameraCorners(viewportCorners);
        return;
      }

      try {
        writeViewRectToCameraCorners(
          camera,
          {
            x1: sampleRect.x,
            y1: sampleRect.y,
            x2: sampleRect.x + sampleRect.size,
            y2: sampleRect.y + sampleRect.size,
          },
          sampleCorners
        );
        writeViewRectToCameraCorners(
          camera,
          { x1: 0, y1: 0, x2: width, y2: height },
          viewportCorners
        );
      } catch {
        // Preview layer not ready yet — skip sampling until it is.
        clearLensCameraCorners(sampleCorners);
        clearLensCameraCorners(viewportCorners);
      }
    },
    [cameraRef, sampleCorners, viewportCorners]
  );

  return { sampleCorners, viewportCorners, updateSampleCameraRect };
};
