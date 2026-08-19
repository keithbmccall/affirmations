import { prefetchCameraRollPhotos } from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos';
import { useEffect } from 'react';

/** Prefetch roll catalog when media-library access is granted. */
export const useCameraRollPrefetch = (enabled = true) => {
  useEffect(() => {
    if (enabled) {
      void prefetchCameraRollPhotos();
    }
  }, [enabled]);
};
