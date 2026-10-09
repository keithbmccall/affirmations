import { CAMERA_ROLL_MEDIA_TYPE } from './cameraRollMediaTypes';
import { queryCameraRollMediaAssets } from './queryCameraRollMediaAssets';
import { cameraRollPhotosCache } from './cameraRollPhotosCache';
import { HEAD_REFRESH_COUNT } from './constants';
import { prefetchCameraRollThumbnails } from './prefetchCameraRollThumbnails';

export const refreshCameraRollHead = async (): Promise<void> => {
  try {
    const result = await queryCameraRollMediaAssets({
      limit: HEAD_REFRESH_COUNT,
      offset: 0,
      mediaTypes: [CAMERA_ROLL_MEDIA_TYPE.IMAGE],
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
