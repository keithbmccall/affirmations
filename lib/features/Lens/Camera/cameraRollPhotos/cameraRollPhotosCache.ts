import { Cache } from '@storage/cache';
import type { Asset } from 'expo-media-library';
import { mergePhotosAtHead } from './mergePhotosAtHead';

export type CameraRollPhotosCache = {
  photos: Asset[];
  endCursor: string | null;
  hasMore: boolean;
  prefetchComplete: boolean;
};

// Shared empty default — callers must not mutate get().photos in place.
const EMPTY_CAMERA_ROLL_PHOTOS_CACHE: CameraRollPhotosCache = {
  photos: [],
  endCursor: null,
  hasMore: true,
  prefetchComplete: false,
};

export class CameraRollPhotosCacheStore extends Cache<CameraRollPhotosCache> {
  mergeHeadPhotos(head: Asset[]): void {
    const current = this.get();
    const mergedPhotos = mergePhotosAtHead(current.photos, head);

    if (mergedPhotos === current.photos) {
      return;
    }

    this.set({ ...current, photos: mergedPhotos });
  }
}

export const cameraRollPhotosCache = new CameraRollPhotosCacheStore(EMPTY_CAMERA_ROLL_PHOTOS_CACHE);

export const getCameraRollPhotosCache = (): CameraRollPhotosCache => {
  return cameraRollPhotosCache.get();
};

export const setCameraRollPhotosCache = (snapshot: CameraRollPhotosCache) => {
  cameraRollPhotosCache.set(snapshot);
};

export const subscribeCameraRollPhotosCache = (listener: () => void) => {
  return cameraRollPhotosCache.subscribe(listener);
};

export const resetCameraRollPhotosCache = () => {
  cameraRollPhotosCache.reset();
};
