import type { CameraRollMediaAsset } from '@features/Lens/Camera/cameraRollPhotos/CameraRollMediaAsset';
import { LOAD_MORE_PAGE_SIZE } from '@features/Lens/Camera/cameraRollPhotos/constants';
import {
  loadMoreCameraRollPhotos,
  resetLoadMoreCameraRollPhotosState,
} from '@features/Lens/Camera/cameraRollPhotos/loadMoreCameraRollPhotos';
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

describe('loadMoreCameraRollPhotos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
    resetLoadMoreCameraRollPhotosState();
  });

  it('re-reads the latest cache before appending tail photos', async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    mockedQueryCameraRollMediaAssets.mockReturnValue(
      new Promise(resolve => {
        resolveFetch = resolve;
      }) as never
    );

    setCameraRollPhotosCache({
      photos: [createAsset('photo-1')],
      nextOffset: 1,
      hasMore: true,
      prefetchComplete: true,
    });

    const loadMorePromise = loadMoreCameraRollPhotos();

    setCameraRollPhotosCache({
      photos: [createAsset('photo-1'), createAsset('photo-head')],
      nextOffset: 1,
      hasMore: true,
      prefetchComplete: true,
    });

    resolveFetch({
      assets: [createAsset('photo-2')],
      hasMore: false,
    });

    await loadMorePromise;

    expect(mockedQueryCameraRollMediaAssets).toHaveBeenCalledWith({
      limit: LOAD_MORE_PAGE_SIZE,
      offset: 1,
      mediaTypes: [CAMERA_ROLL_MEDIA_TYPE.IMAGE],
    });

    const cache = getCameraRollPhotosCache();
    expect(cache.photos.map(asset => asset.id)).toEqual(['photo-1', 'photo-head', 'photo-2']);
    expect(cache.nextOffset).toBe(2);
    expect(cache.hasMore).toBe(false);
  });
});
