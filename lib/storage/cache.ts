import { Asset } from 'expo-media-library';

const photosCache = new Map<'cache', Asset[]>();

export const setCameraRollPhotosCache = (photos: Asset[]) => {
  photosCache.set('cache', photos);
};

export const getCameraRollPhotosCache = () => {
  return photosCache.get('cache') || [];
};

export const resetCameraRollPhotosCache = () => {
  photosCache.delete('cache');
};
