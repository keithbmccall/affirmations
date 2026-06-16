import { Asset } from 'expo-media-library';

export type CameraRollPhotosCache = {
  photos: Asset[];
  endCursor: string | null;
  hasMore: boolean;
  prefetchComplete: boolean;
};

const EMPTY_CAMERA_ROLL_PHOTOS_CACHE: CameraRollPhotosCache = {
  photos: [],
  endCursor: null,
  hasMore: true,
  prefetchComplete: false,
};

let photosCache: CameraRollPhotosCache | null = null;

const cacheSubscribers = new Set<() => void>();

const notifyCameraRollPhotosCacheSubscribers = () => {
  cacheSubscribers.forEach(listener => {
    listener();
  });
};

export const getCameraRollPhotosCache = (): CameraRollPhotosCache => {
  return photosCache ?? EMPTY_CAMERA_ROLL_PHOTOS_CACHE;
};

export const setCameraRollPhotosCache = (snapshot: CameraRollPhotosCache) => {
  photosCache = snapshot;
  notifyCameraRollPhotosCacheSubscribers();
};

export const subscribeCameraRollPhotosCache = (listener: () => void) => {
  cacheSubscribers.add(listener);
  return () => {
    cacheSubscribers.delete(listener);
  };
};

export const resetCameraRollPhotosCache = () => {
  photosCache = null;
  notifyCameraRollPhotosCacheSubscribers();
};
