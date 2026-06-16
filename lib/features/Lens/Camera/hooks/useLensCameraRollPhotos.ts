import { loadMoreCameraRollPhotos } from '@features/Lens/Camera/cameraRollPhotos/loadMoreCameraRollPhotos';
import {
  getPrefetchCameraRollPhotosPromise,
  prefetchCameraRollPhotos,
} from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos';
import { refreshCameraRollHead } from '@features/Lens/Camera/cameraRollPhotos/refreshCameraRollHead';
import {
  getCameraRollPhotosCache,
  subscribeCameraRollPhotosCache,
} from '@storage/cache';
import { useCallback, useEffect, useState } from 'react';

const CATALOG_ERROR_MESSAGE = 'Failed to load photos from camera roll';

const syncPhotosFromCache = () => {
  return getCameraRollPhotosCache().photos;
};

const applyPrefetchResultToState = (
  setPhotos: (photos: ReturnType<typeof syncPhotosFromCache>) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const updated = getCameraRollPhotosCache();
  setPhotos(updated.photos);

  if (updated.prefetchComplete) {
    setLoading(false);
    setError(null);
    return;
  }

  setLoading(false);
  setError(CATALOG_ERROR_MESSAGE);
};

export const useLensCameraRollPhotos = () => {
  const initialCache = getCameraRollPhotosCache();
  const [photos, setPhotos] = useState(syncPhotosFromCache);
  const [loading, setLoading] = useState(
    initialCache.photos.length === 0 && !initialCache.prefetchComplete
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeCameraRollPhotosCache(() => {
      const snapshot = getCameraRollPhotosCache();
      setPhotos(snapshot.photos);

      if (snapshot.prefetchComplete) {
        setLoading(false);
        setError(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const snapshot = getCameraRollPhotosCache();

    if (snapshot.photos.length === 0 && !snapshot.prefetchComplete) {
      setLoading(true);
      const waitForPrefetch =
        getPrefetchCameraRollPhotosPromise() ?? prefetchCameraRollPhotos();

      void waitForPrefetch.finally(() => {
        applyPrefetchResultToState(setPhotos, setLoading, setError);

        if (getCameraRollPhotosCache().prefetchComplete) {
          void refreshCameraRollHead();
        }
      });
      return;
    }

    if (snapshot.prefetchComplete) {
      void refreshCameraRollHead();
    }
  }, []);

  const loadMore = useCallback(() => {
    const snapshot = getCameraRollPhotosCache();

    if (!snapshot.hasMore || !snapshot.prefetchComplete) {
      return;
    }

    void loadMoreCameraRollPhotos();
  }, []);

  return {
    photos,
    loading,
    error,
    loadMore,
  };
};
