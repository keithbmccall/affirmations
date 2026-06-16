import { getAssetsAsync } from 'expo-media-library';
import { cameraRollPhotosCache } from './cameraRollPhotosCache';
import { HEAD_REFRESH_COUNT } from './constants';
import { prefetchCameraRollThumbnails } from './prefetchCameraRollThumbnails';

export const refreshCameraRollHead = async (): Promise<void> => {
  try {
    const result = await getAssetsAsync({
      first: HEAD_REFRESH_COUNT,
      mediaType: ['photo'],
      sortBy: ['creationTime'],
    });

    cameraRollPhotosCache.mergeHeadPhotos(result.assets);

    void prefetchCameraRollThumbnails(result.assets);
  } catch (error) {
    console.error('Error refreshing camera roll head:', error);
  }
};

export const requestCameraRollHeadRefresh = (): void => {
  void refreshCameraRollHead();
};
