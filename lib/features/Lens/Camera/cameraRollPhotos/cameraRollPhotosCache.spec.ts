import {
  cameraRollPhotosCache,
  getCameraRollPhotosCache,
  resetCameraRollPhotosCache,
  setCameraRollPhotosCache,
  subscribeCameraRollPhotosCache,
} from '@features/Lens/Camera/cameraRollPhotos/cameraRollPhotosCache';
import type { Asset } from 'expo-media-library';

const createAsset = (id: string, creationTime = 0): Asset =>
  ({
    id,
    uri: `file:///${id}.jpg`,
    mediaType: 'photo',
    width: 100,
    height: 100,
    filename: `${id}.jpg`,
    creationTime,
    modificationTime: 0,
    duration: 0,
  }) as Asset;

describe('cameraRollPhotosCache', () => {
  beforeEach(() => {
    resetCameraRollPhotosCache();
  });

  it('mergeHeadPhotos skips notify when head ids match the existing prefix', () => {
    const listener = jest.fn();

    setCameraRollPhotosCache({
      photos: [createAsset('photo-1'), createAsset('photo-2'), createAsset('photo-3')],
      endCursor: 'cursor-3',
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
      endCursor: 'cursor-1',
      hasMore: true,
      prefetchComplete: true,
    });

    cameraRollPhotosCache.mergeHeadPhotos([createAsset('photo-new')]);

    const cache = getCameraRollPhotosCache();
    expect(cache.photos.map(asset => asset.id)).toEqual(['photo-new', 'photo-1']);
    expect(cache.endCursor).toBe('cursor-1');
    expect(cache.hasMore).toBe(true);
    expect(cache.prefetchComplete).toBe(true);
  });

  it('mergeHeadPhotos re-reads the latest snapshot at write time', () => {
    setCameraRollPhotosCache({
      photos: [createAsset('photo-1')],
      endCursor: 'cursor-1',
      hasMore: true,
      prefetchComplete: true,
    });

    setCameraRollPhotosCache({
      photos: [createAsset('photo-1'), createAsset('photo-tail')],
      endCursor: 'cursor-2',
      hasMore: true,
      prefetchComplete: true,
    });

    cameraRollPhotosCache.mergeHeadPhotos([createAsset('photo-new')]);

    const cache = getCameraRollPhotosCache();
    expect(cache.photos.map(asset => asset.id)).toEqual(['photo-new', 'photo-1', 'photo-tail']);
    expect(cache.endCursor).toBe('cursor-2');
  });
});
