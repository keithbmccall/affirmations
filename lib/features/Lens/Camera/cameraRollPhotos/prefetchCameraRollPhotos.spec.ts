import { PREFETCH_COUNT } from '@features/Lens/Camera/cameraRollPhotos/constants';
import { prefetchCameraRollThumbnails } from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollThumbnails';
import {
  getPrefetchCameraRollPhotosPromise,
  prefetchCameraRollPhotos,
  resetPrefetchCameraRollPhotosState,
} from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos';
import {
  getCameraRollPhotosCache,
  resetCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from './cameraRollPhotosCache';
import { getAssetsAsync, type Asset } from 'expo-media-library';

jest.mock('expo-media-library', () => ({
  getAssetsAsync: jest.fn(),
}));

jest.mock('@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollThumbnails', () => ({
  prefetchCameraRollThumbnails: jest.fn(() => Promise.resolve()),
}));

const mockedGetAssetsAsync = getAssetsAsync as jest.MockedFunction<typeof getAssetsAsync>;

const createAsset = (id: string): Asset =>
  ({
    id,
    uri: `file:///${id}.jpg`,
    mediaType: 'photo',
    width: 100,
    height: 100,
    filename: `${id}.jpg`,
    creationTime: 0,
    modificationTime: 0,
    duration: 0,
  }) as Asset;

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

    mockedGetAssetsAsync.mockResolvedValue({
      assets,
      endCursor: 'cursor-300',
      hasNextPage: true,
      totalCount: 500,
    } as never);

    await prefetchCameraRollPhotos();

    expect(mockedGetAssetsAsync).toHaveBeenCalledTimes(1);
    expect(mockedGetAssetsAsync).toHaveBeenCalledWith({
      first: PREFETCH_COUNT,
      mediaType: ['photo'],
      sortBy: ['creationTime'],
    });

    const cache = getCameraRollPhotosCache();
    expect(cache.photos).toHaveLength(300);
    expect(cache.endCursor).toBe('cursor-300');
    expect(cache.hasMore).toBe(true);
    expect(cache.prefetchComplete).toBe(true);
    expect(mockedPrefetchCameraRollThumbnails).toHaveBeenCalledWith(assets);
  });

  it('prefetches thumbnails when catalog prefetch is already complete', async () => {
    const cachedAssets = [createAsset('cached')];

    setCameraRollPhotosCache({
      photos: cachedAssets,
      endCursor: null,
      hasMore: false,
      prefetchComplete: true,
    });

    await prefetchCameraRollPhotos();

    expect(mockedGetAssetsAsync).not.toHaveBeenCalled();
    expect(mockedPrefetchCameraRollThumbnails).toHaveBeenCalledWith(cachedAssets);
  });

  it('leaves cache incomplete when prefetch fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetAssetsAsync.mockRejectedValueOnce(new Error('permission denied'));

    await prefetchCameraRollPhotos();

    const cache = getCameraRollPhotosCache();
    expect(cache.prefetchComplete).toBe(false);
    expect(cache.photos).toHaveLength(0);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('reuses the in-flight prefetch promise', async () => {
    let resolvePrefetch: (value: unknown) => void = () => {};
    mockedGetAssetsAsync.mockReturnValue(
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
      endCursor: null,
      hasNextPage: false,
      totalCount: 1,
    });

    await firstCall;

    expect(mockedGetAssetsAsync).toHaveBeenCalledTimes(1);
  });
});
