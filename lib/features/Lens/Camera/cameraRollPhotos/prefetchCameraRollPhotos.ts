import {
  getCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from '@storage/cache';
import { getAssetsAsync } from 'expo-media-library';
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
      const result = await getAssetsAsync({
        first: PREFETCH_COUNT,
        mediaType: ['photo'],
        sortBy: ['creationTime'],
      });

      setCameraRollPhotosCache({
        photos: result.assets,
        endCursor: result.endCursor,
        hasMore: result.hasNextPage,
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
