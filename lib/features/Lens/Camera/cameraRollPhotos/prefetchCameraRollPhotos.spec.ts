import type { CameraRollMediaAsset } from '@features/Lens/Camera/cameraRollPhotos/CameraRollMediaAsset';
import { PREFETCH_COUNT } from '@features/Lens/Camera/cameraRollPhotos/constants';
import { prefetchCameraRollThumbnails } from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollThumbnails';
import {
  getPrefetchCameraRollPhotosPromise,
  prefetchCameraRollPhotos,
  resetPrefetchCameraRollPhotosState,
} from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos';
import { queryCameraRollMediaAssets } from '@features/Lens/Camera/cameraRollPhotos/queryCameraRollMediaAssets';
import {
  getCameraRollPhotosCache,
  resetCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from './cameraRollPhotosCache';
import { CAMERA_ROLL_MEDIA_TYPE } from '@features/Lens/Camera/cameraRollPhotos/cameraRollMediaTypes';

jest.mock('@features/Lens/Camera/cameraRollPhotos/queryCameraRollMediaAssets', () => ({
  queryCameraRollMediaAssets: jest.fn(),
}));

jest.mock('@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollThumbnails', () => ({
  prefetchCameraRollThumbnails: jest.fn(() => Promise.resolve()),
}));

const mockedQueryCameraRollMediaAssets = queryCameraRollMediaAssets as jest.MockedFunction<
  typeof queryCameraRollMediaAssets
>;

const createAsset = (id: string): CameraRollMediaAsset => ({
  id,
  uri: `file:///${id}.jpg`,
  mediaType: 'image',
  width: 100,
  height: 100,
  filename: `${id}.jpg`,
  creationTime: 0,
  modificationTime: 0,
  duration: 0,
});

const mockedPrefetchCameraRollThumbnails = prefetchCameraRollThumbnails as jest.MockedFunction<
  typeof prefetchCameraRollThumbnails
>;

describe('prefetchCameraRollPhotos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
    resetPrefetchCameraRollPhotosState();
  });

  it('fetches up to 300 photos in a single request', async () => {
    const assets = Array.from({ length: 300 }, (_, index) => createAsset(`photo-${index}`));

    mockedQueryCameraRollMediaAssets.mockResolvedValue({
      assets,
      hasMore: true,
    });

    await prefetchCameraRollPhotos();

    expect(mockedQueryCameraRollMediaAssets).toHaveBeenCalledTimes(1);
    expect(mockedQueryCameraRollMediaAssets).toHaveBeenCalledWith({
      limit: PREFETCH_COUNT,
      offset: 0,
      mediaTypes: [CAMERA_ROLL_MEDIA_TYPE.IMAGE],
    });

    const cache = getCameraRollPhotosCache();
    expect(cache.photos).toHaveLength(300);
    expect(cache.nextOffset).toBe(300);
    expect(cache.hasMore).toBe(true);
    expect(cache.prefetchComplete).toBe(true);
    expect(mockedPrefetchCameraRollThumbnails).toHaveBeenCalledWith(assets);
  });

  it('prefetches thumbnails when catalog prefetch is already complete', async () => {
    const cachedAssets = [createAsset('cached')];

    setCameraRollPhotosCache({
      photos: cachedAssets,
      nextOffset: 1,
      hasMore: false,
      prefetchComplete: true,
    });

    await prefetchCameraRollPhotos();

    expect(mockedQueryCameraRollMediaAssets).not.toHaveBeenCalled();
    expect(mockedPrefetchCameraRollThumbnails).toHaveBeenCalledWith(cachedAssets);
  });

  it('leaves cache incomplete when prefetch fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedQueryCameraRollMediaAssets.mockRejectedValueOnce(new Error('permission denied'));

    await prefetchCameraRollPhotos();

    const cache = getCameraRollPhotosCache();
    expect(cache.prefetchComplete).toBe(false);
    expect(cache.photos).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('reuses the in-flight prefetch promise', async () => {
    let resolvePrefetch: (value: unknown) => void = () => {};
    mockedQueryCameraRollMediaAssets.mockReturnValue(
      new Promise(resolve => {
        resolvePrefetch = resolve;
      }) as never
    );

    const firstCall = prefetchCameraRollPhotos();
    const secondCall = prefetchCameraRollPhotos();

    expect(getPrefetchCameraRollPhotosPromise()).not.toBeNull();
    expect(firstCall).toBe(secondCall);

    resolvePrefetch({
      assets: [createAsset('photo-1')],
      hasMore: false,
    });

    await firstCall;

    expect(mockedQueryCameraRollMediaAssets).toHaveBeenCalledTimes(1);
  });
});
