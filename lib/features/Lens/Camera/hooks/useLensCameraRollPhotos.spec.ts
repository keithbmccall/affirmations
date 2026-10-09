import { PREFETCH_COUNT } from '@features/Lens/Camera/cameraRollPhotos/constants';
import type { CameraRollMediaAsset } from '@features/Lens/Camera/cameraRollPhotos/CameraRollMediaAsset';
import { resetLoadMoreCameraRollPhotosState } from '@features/Lens/Camera/cameraRollPhotos/loadMoreCameraRollPhotos';
import {
  getPrefetchCameraRollPhotosPromise,
  prefetchCameraRollPhotos,
  resetPrefetchCameraRollPhotosState,
} from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollPhotos';
import { queryCameraRollMediaAssets } from '@features/Lens/Camera/cameraRollPhotos/queryCameraRollMediaAssets';
import { useLensCameraRollPhotos } from '@features/Lens/Camera/hooks/useLensCameraRollPhotos';
import {
  getCameraRollPhotosCache,
  resetCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from '@features/Lens/Camera/cameraRollPhotos/cameraRollPhotosCache';
import { CAMERA_ROLL_MEDIA_TYPE } from '@features/Lens/Camera/cameraRollPhotos/cameraRollMediaTypes';
import { act, renderHook } from '@testing-library/react-native';

jest.mock('@features/Lens/Camera/cameraRollPhotos/queryCameraRollMediaAssets', () => ({
  queryCameraRollMediaAssets: jest.fn().mockResolvedValue({
    assets: [],
    hasMore: false,
  }),
}));

jest.mock('@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollThumbnails', () => ({
  prefetchCameraRollThumbnails: jest.fn(() => Promise.resolve()),
}));

jest.mock('@features/Lens/Camera/cameraRollPhotos/refreshCameraRollHead', () => ({
  refreshCameraRollHead: jest.fn(() => Promise.resolve()),
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
      nextOffset: 2,
      hasMore: true,
      prefetchComplete: true,
    });

    const { result } = renderHook(() => useLensCameraRollPhotos());

    expect(result.current.photos).toHaveLength(2);
    expect(result.current.loading).toBe(false);
  });

  it('waits for in-flight prefetch without duplicate fetch before prefetch completes', async () => {
    let resolvePrefetch: (value: unknown) => void = () => {};
    mockedQueryCameraRollMediaAssets.mockReturnValueOnce(
      new Promise(resolve => {
        resolvePrefetch = resolve;
      }) as never
    );

    const prefetchPromise = prefetchCameraRollPhotos();
    expect(getPrefetchCameraRollPhotosPromise()).not.toBeNull();

    const { result } = renderHook(() => useLensCameraRollPhotos());

    expect(result.current.loading).toBe(true);
    expect(result.current.photos).toHaveLength(0);
    expect(mockedQueryCameraRollMediaAssets).toHaveBeenCalledTimes(1);

    resolvePrefetch({
      assets: [createAsset('prefetched-1')],
      hasMore: false,
    });

    await act(async () => {
      await prefetchPromise;
    });

    expect(result.current.photos).toHaveLength(1);
    expect(result.current.loading).toBe(false);
    expect(mockedQueryCameraRollMediaAssets).toHaveBeenCalledTimes(1);
  });

  it('clears loading when prefetch completes with an empty library', async () => {
    mockedQueryCameraRollMediaAssets.mockResolvedValue({
      assets: [],
      hasMore: false,
    });

    setCameraRollPhotosCache({
      photos: [],
      nextOffset: 0,
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
    mockedQueryCameraRollMediaAssets.mockRejectedValueOnce(new Error('permission denied'));

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
      nextOffset: PREFETCH_COUNT,
      hasMore: true,
      prefetchComplete: true,
    });

    mockedQueryCameraRollMediaAssets.mockResolvedValueOnce({
      assets: [createAsset('photo-301'), createAsset('photo-302')],
      hasMore: false,
    });

    const { result } = renderHook(() => useLensCameraRollPhotos());

    expect(result.current.photos).toHaveLength(PREFETCH_COUNT);

    await act(async () => {
      result.current.loadMore();
    });

    expect(mockedQueryCameraRollMediaAssets).toHaveBeenCalledWith({
      limit: 30,
      offset: PREFETCH_COUNT,
      mediaTypes: [CAMERA_ROLL_MEDIA_TYPE.IMAGE],
    });
    expect(result.current.photos).toHaveLength(PREFETCH_COUNT + 2);
    expect(getCameraRollPhotosCache().nextOffset).toBe(PREFETCH_COUNT + 2);
  });
});
