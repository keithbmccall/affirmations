import { HEAD_REFRESH_COUNT } from '@features/Lens/Camera/cameraRollPhotos/constants';
import { refreshCameraRollHead } from '@features/Lens/Camera/cameraRollPhotos/refreshCameraRollHead';
import {
  getCameraRollPhotosCache,
  resetCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from './cameraRollPhotosCache';
import { getAssetsAsync, type Asset } from 'expo-media-library';

jest.mock('expo-media-library', () => ({
  getAssetsAsync: jest.fn(),
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

describe('refreshCameraRollHead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
  });

  it('merges new head photos ahead of existing tail without duplicate ids', async () => {
    setCameraRollPhotosCache({
      photos: [createAsset('photo-1'), createAsset('photo-2'), createAsset('photo-3')],
      endCursor: 'cursor-3',
      hasMore: true,
      prefetchComplete: true,
    });

    mockedGetAssetsAsync.mockResolvedValue({
      assets: [createAsset('photo-new'), createAsset('photo-2')],
      endCursor: 'cursor-head',
      hasNextPage: true,
      totalCount: 4,
    } as never);

    await refreshCameraRollHead();

    expect(mockedGetAssetsAsync).toHaveBeenCalledWith({
      first: HEAD_REFRESH_COUNT,
      mediaType: ['photo'],
      sortBy: ['creationTime'],
    });

    const cache = getCameraRollPhotosCache();
    expect(cache.photos.map(asset => asset.id)).toEqual(['photo-new', 'photo-2', 'photo-1', 'photo-3']);
    expect(cache.endCursor).toBe('cursor-3');
    expect(cache.prefetchComplete).toBe(true);
  });

  it('re-reads the latest cache before writing after fetch completes', async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    mockedGetAssetsAsync.mockReturnValue(
      new Promise(resolve => {
        resolveFetch = resolve;
      }) as never
    );

    setCameraRollPhotosCache({
      photos: [createAsset('photo-1')],
      endCursor: 'cursor-1',
      hasMore: true,
      prefetchComplete: true,
    });

    const refreshPromise = refreshCameraRollHead();

    setCameraRollPhotosCache({
      photos: [createAsset('photo-1'), createAsset('photo-tail')],
      endCursor: 'cursor-2',
      hasMore: true,
      prefetchComplete: true,
    });

    resolveFetch({
      assets: [createAsset('photo-new')],
      endCursor: 'cursor-head',
      hasNextPage: true,
      totalCount: 3,
    });

    await refreshPromise;

    const cache = getCameraRollPhotosCache();
    expect(cache.photos.map(asset => asset.id)).toEqual(['photo-new', 'photo-1', 'photo-tail']);
    expect(cache.endCursor).toBe('cursor-2');
  });
});
