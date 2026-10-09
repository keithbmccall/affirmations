import {
  cameraRollPhotosCache,
  getCameraRollPhotosCache,
  resetCameraRollPhotosCache,
  setCameraRollPhotosCache,
  subscribeCameraRollPhotosCache,
} from '@features/Lens/Camera/cameraRollPhotos/cameraRollPhotosCache';
import type { CameraRollMediaAsset } from '@features/Lens/Camera/cameraRollPhotos/CameraRollMediaAsset';

const createAsset = (id: string, creationTime = 0): CameraRollMediaAsset => ({
  id,
  uri: `file:///${id}.jpg`,
  mediaType: 'image',
  width: 100,
  height: 100,
  filename: `${id}.jpg`,
  creationTime,
  modificationTime: 0,
  duration: 0,
});

describe('cameraRollPhotosCache', () => {
  beforeEach(() => {
    resetCameraRollPhotosCache();
  });

  it('mergeHeadPhotos skips notify when head ids match the existing prefix', () => {
    const listener = jest.fn();

    setCameraRollPhotosCache({
      photos: [createAsset('photo-1'), createAsset('photo-2'), createAsset('photo-3')],
      nextOffset: 3,
      hasMore: true,
      prefetchComplete: true,
    });

    subscribeCameraRollPhotosCache(listener);

    cameraRollPhotosCache.mergeHeadPhotos([createAsset('photo-1'), createAsset('photo-2')]);

    expect(listener).not.toHaveBeenCalled();
    expect(getCameraRollPhotosCache().photos.map(asset => asset.id)).toEqual([
      'photo-1',
      'photo-2',
      'photo-3',
    ]);
  });

  it('mergeHeadPhotos preserves pagination fields', () => {
    setCameraRollPhotosCache({
      photos: [createAsset('photo-1')],
      nextOffset: 1,
      hasMore: true,
      prefetchComplete: true,
    });

    cameraRollPhotosCache.mergeHeadPhotos([createAsset('photo-new')]);

    const cache = getCameraRollPhotosCache();
    expect(cache.photos.map(asset => asset.id)).toEqual(['photo-new', 'photo-1']);
    expect(cache.nextOffset).toBe(1);
    expect(cache.hasMore).toBe(true);
    expect(cache.prefetchComplete).toBe(true);
  });

  it('mergeHeadPhotos re-reads the latest snapshot at write time', () => {
    setCameraRollPhotosCache({
      photos: [createAsset('photo-1')],
      nextOffset: 1,
      hasMore: true,
      prefetchComplete: true,
    });

    setCameraRollPhotosCache({
      photos: [createAsset('photo-1'), createAsset('photo-tail')],
      nextOffset: 2,
      hasMore: true,
      prefetchComplete: true,
    });

    cameraRollPhotosCache.mergeHeadPhotos([createAsset('photo-new')]);

    const cache = getCameraRollPhotosCache();
    expect(cache.photos.map(asset => asset.id)).toEqual(['photo-new', 'photo-1', 'photo-tail']);
    expect(cache.nextOffset).toBe(2);
  });
});
