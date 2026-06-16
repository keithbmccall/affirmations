import { LOAD_MORE_PAGE_SIZE } from '@features/Lens/Camera/cameraRollPhotos/constants';
import {
  loadMoreCameraRollPhotos,
  resetLoadMoreCameraRollPhotosState,
} from '@features/Lens/Camera/cameraRollPhotos/loadMoreCameraRollPhotos';
import {
  getCameraRollPhotosCache,
  resetCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from '@storage/cache';
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

describe('loadMoreCameraRollPhotos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
    resetLoadMoreCameraRollPhotosState();
  });

  it('re-reads the latest cache before appending tail photos', async () => {
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

    const loadMorePromise = loadMoreCameraRollPhotos();

    setCameraRollPhotosCache({
      photos: [createAsset('photo-1'), createAsset('photo-head')],
      endCursor: 'cursor-1',
      hasMore: true,
      prefetchComplete: true,
    });

    resolveFetch({
      assets: [createAsset('photo-2')],
      endCursor: 'cursor-2',
      hasNextPage: false,
      totalCount: 3,
    });

    await loadMorePromise;

    expect(mockedGetAssetsAsync).toHaveBeenCalledWith({
      first: LOAD_MORE_PAGE_SIZE,
      mediaType: ['photo'],
      sortBy: ['creationTime'],
      after: 'cursor-1',
    });

    const cache = getCameraRollPhotosCache();
    expect(cache.photos.map(asset => asset.id)).toEqual(['photo-1', 'photo-head', 'photo-2']);
    expect(cache.endCursor).toBe('cursor-2');
    expect(cache.hasMore).toBe(false);
  });
});
