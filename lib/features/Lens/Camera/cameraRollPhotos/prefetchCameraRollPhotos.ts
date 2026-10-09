import {
  getCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from './cameraRollPhotosCache';
import { CAMERA_ROLL_MEDIA_TYPE } from './cameraRollMediaTypes';
import { queryCameraRollMediaAssets } from './queryCameraRollMediaAssets';
import { PREFETCH_COUNT } from './constants';
import { prefetchCameraRollThumbnails } from './prefetchCameraRollThumbnails';

let prefetchInFlight: Promise<void> | null = null;

export const getPrefetchCameraRollPhotosPromise = (): Promise<void> | null => {
  return prefetchInFlight;
};

export const prefetchCameraRollPhotos = (): Promise<void> => {
  const existing = getCameraRollPhotosCache();

  if (existing.prefetchComplete) {
    void prefetchCameraRollThumbnails(existing.photos);
    return Promise.resolve();
  }

  if (prefetchInFlight !== null) {
    return prefetchInFlight;
  }

  prefetchInFlight = (async () => {
    try {
      const result = await queryCameraRollMediaAssets({
        limit: PREFETCH_COUNT,
        offset: 0,
        mediaTypes: [CAMERA_ROLL_MEDIA_TYPE.IMAGE],
      });

      setCameraRollPhotosCache({
        photos: result.assets,
        nextOffset: result.assets.length,
        hasMore: result.hasMore,
        prefetchComplete: true,
      });

      await prefetchCameraRollThumbnails(result.assets);
    } catch (error) {
      console.error('Error prefetching camera roll photos:', error);
    } finally {
      prefetchInFlight = null;
    }
  })();

  return prefetchInFlight;
};

export const resetPrefetchCameraRollPhotosState = () => {
  prefetchInFlight = null;
};
