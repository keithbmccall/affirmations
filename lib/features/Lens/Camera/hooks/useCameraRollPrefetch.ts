import { prefetchCameraRollPhotos } from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos';
import { useLensPermissions } from '@features/Lens/Camera/hooks/useLensPermissions';
import { useEffect } from 'react';

export const useCameraRollPrefetch = () => {
  const { mediaLibraryPermission } = useLensPermissions();

  useEffect(() => {
    if (mediaLibraryPermission) {
      void prefetchCameraRollPhotos();
    }
  }, [mediaLibraryPermission]);
};
