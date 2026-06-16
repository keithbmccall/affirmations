import { PREFETCH_COUNT } from '@features/Lens/Camera/cameraRollPhotos/constants';
import { resetLoadMoreCameraRollPhotosState } from '@features/Lens/Camera/cameraRollPhotos/loadMoreCameraRollPhotos';
import {
  getPrefetchCameraRollPhotosPromise,
  prefetchCameraRollPhotos,
  resetPrefetchCameraRollPhotosState,
} from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos';
import { useLensCameraRollPhotos } from '@features/Lens/Camera/hooks/useLensCameraRollPhotos';
import {
  getCameraRollPhotosCache,
  resetCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from '@storage/cache';
import { act, renderHook } from '@testing-library/react-native';
import { getAssetsAsync, type Asset } from 'expo-media-library';

jest.mock('expo-media-library', () => ({
  getAssetsAsync: jest.fn().mockResolvedValue({
    assets: [],
    endCursor: null,
    hasNextPage: false,
    totalCount: 0,
  }),
}));

jest.mock('@features/Lens/Camera/cameraRollPhotos/refreshCameraRollHead', () => ({
  refreshCameraRollHead: jest.fn(() => Promise.resolve()),
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

describe('useLensCameraRollPhotos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
    resetPrefetchCameraRollPhotosState();
    resetLoadMoreCameraRollPhotosState();
  });

  it('seeds photos from cache on mount', () => {
    setCameraRollPhotosCache({
      photos: [createAsset('cached-1'), createAsset('cached-2')],
      endCursor: 'cursor-1',
      hasMore: true,
      prefetchComplete: true,
    });

    const { result } = renderHook(() => useLensCameraRollPhotos());

    expect(result.current.photos).toHaveLength(2);
    expect(result.current.loading).toBe(false);
  });

  it('waits for in-flight prefetch without duplicate fetch before prefetch completes', async () => {
    let resolvePrefetch: (value: unknown) => void = () => {};
    mockedGetAssetsAsync.mockReturnValueOnce(
      new Promise(resolve => {
        resolvePrefetch = resolve;
      }) as never
    );

    const prefetchPromise = prefetchCameraRollPhotos();
    expect(getPrefetchCameraRollPhotosPromise()).not.toBeNull();

    const { result } = renderHook(() => useLensCameraRollPhotos());

    expect(result.current.loading).toBe(true);
    expect(result.current.photos).toHaveLength(0);
    expect(mockedGetAssetsAsync).toHaveBeenCalledTimes(1);

    resolvePrefetch({
      assets: [createAsset('prefetched-1')],
      endCursor: null,
      hasNextPage: false,
      totalCount: 1,
    });

    await act(async () => {
      await prefetchPromise;
    });

    expect(result.current.photos).toHaveLength(1);
    expect(result.current.loading).toBe(false);
    expect(mockedGetAssetsAsync).toHaveBeenCalledTimes(1);
  });

  it('clears loading when prefetch completes with an empty library', async () => {
    mockedGetAssetsAsync.mockResolvedValue({
      assets: [],
      endCursor: null,
      hasNextPage: false,
      totalCount: 0,
    } as never);

    setCameraRollPhotosCache({
      photos: [],
      endCursor: null,
      hasMore: false,
      prefetchComplete: true,
    });

    const { result } = renderHook(() => useLensCameraRollPhotos());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.photos).toHaveLength(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('shows an error when prefetch fails with an empty cache', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetAssetsAsync.mockRejectedValueOnce(new Error('permission denied'));

    const { result } = renderHook(() => useLensCameraRollPhotos());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.photos).toHaveLength(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load photos from camera roll');

    consoleSpy.mockRestore();
  });

  it('appends tail photos silently via loadMore', async () => {
    const prefetchedAssets = Array.from({ length: PREFETCH_COUNT }, (_, index) =>
      createAsset(`photo-${index}`)
    );

    setCameraRollPhotosCache({
      photos: prefetchedAssets,
      endCursor: 'cursor-300',
      hasMore: true,
      prefetchComplete: true,
    });

    mockedGetAssetsAsync.mockResolvedValueOnce({
      assets: [createAsset('photo-301'), createAsset('photo-302')],
      endCursor: 'cursor-302',
      hasNextPage: false,
      totalCount: 302,
    } as never);

    const { result } = renderHook(() => useLensCameraRollPhotos());

    expect(result.current.photos).toHaveLength(PREFETCH_COUNT);

    await act(async () => {
      result.current.loadMore();
    });

    expect(mockedGetAssetsAsync).toHaveBeenCalledWith({
      first: 30,
      mediaType: ['photo'],
      sortBy: ['creationTime'],
      after: 'cursor-300',
    });
    expect(result.current.photos).toHaveLength(PREFETCH_COUNT + 2);
  });
});
