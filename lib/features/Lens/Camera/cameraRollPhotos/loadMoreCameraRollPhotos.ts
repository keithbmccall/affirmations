import {
  getCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from './cameraRollPhotosCache';
import { CAMERA_ROLL_MEDIA_TYPE } from './cameraRollMediaTypes';
import { queryCameraRollMediaAssets } from './queryCameraRollMediaAssets';
import { LOAD_MORE_PAGE_SIZE } from './constants';
import { prefetchCameraRollThumbnails } from './prefetchCameraRollThumbnails';

let isFetchingMore = false;

export const loadMoreCameraRollPhotos = async (): Promise<void> => {
  const current = getCameraRollPhotosCache();

  if (isFetchingMore || !current.hasMore || !current.prefetchComplete) {
    return;
  }

  isFetchingMore = true;
  const requestOffset = current.nextOffset;

  try {
    const result = await queryCameraRollMediaAssets({
      limit: LOAD_MORE_PAGE_SIZE,
      offset: requestOffset,
      mediaTypes: [CAMERA_ROLL_MEDIA_TYPE.IMAGE],
    });

    const latest = getCameraRollPhotosCache();

    setCameraRollPhotosCache({
      photos: [...latest.photos, ...result.assets],
      nextOffset: requestOffset + result.assets.length,
      hasMore: result.hasMore,
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
