import { prefetchCameraRollPhotos } from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos';
import { useEffect } from 'react';

/** Prefetch roll catalog. Only mount after Lens hallway has granted media-library access. */
export const useCameraRollPrefetch = () => {
  useEffect(() => {
    void prefetchCameraRollPhotos();
  }, []);
};
