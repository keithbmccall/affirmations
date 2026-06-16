import {
  getCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from './cameraRollPhotosCache';
import { getAssetsAsync } from 'expo-media-library';
import { LOAD_MORE_PAGE_SIZE } from './constants';
import { prefetchCameraRollThumbnails } from './prefetchCameraRollThumbnails';

let isFetchingMore = false;

export const loadMoreCameraRollPhotos = async (): Promise<void> => {
  const current = getCameraRollPhotosCache();

  if (isFetchingMore || !current.hasMore || !current.prefetchComplete) {
    return;
  }

  isFetchingMore = true;
  const requestCursor = current.endCursor;

  try {
    const result = await getAssetsAsync({
      first: LOAD_MORE_PAGE_SIZE,
      mediaType: ['photo'],
      sortBy: ['creationTime'],
      after: requestCursor ?? undefined,
    });

    const latest = getCameraRollPhotosCache();

    setCameraRollPhotosCache({
      photos: [...latest.photos, ...result.assets],
      endCursor: result.endCursor,
      hasMore: result.hasNextPage,
      prefetchComplete: latest.prefetchComplete,
    });

    void prefetchCameraRollThumbnails(result.assets);
  } catch (error) {
    console.error('Error loading more camera roll photos:', error);
  } finally {
    isFetchingMore = false;
  }
};

export const resetLoadMoreCameraRollPhotosState = () => {
  isFetchingMore = false;
};
