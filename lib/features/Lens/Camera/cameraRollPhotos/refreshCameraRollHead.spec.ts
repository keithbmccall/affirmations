import type { CameraRollMediaAsset } from '@features/Lens/Camera/cameraRollPhotos/CameraRollMediaAsset';
import { HEAD_REFRESH_COUNT } from '@features/Lens/Camera/cameraRollPhotos/constants';
import { refreshCameraRollHead } from '@features/Lens/Camera/cameraRollPhotos/refreshCameraRollHead';
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

describe('refreshCameraRollHead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
  });

  it('merges new head photos ahead of existing tail without duplicate ids', async () => {
    setCameraRollPhotosCache({
      photos: [createAsset('photo-1'), createAsset('photo-2'), createAsset('photo-3')],
      nextOffset: 3,
      hasMore: true,
      prefetchComplete: true,
    });

    mockedQueryCameraRollMediaAssets.mockResolvedValue({
      assets: [createAsset('photo-new'), createAsset('photo-2')],
      hasMore: true,
    });

    await refreshCameraRollHead();

    expect(mockedQueryCameraRollMediaAssets).toHaveBeenCalledWith({
      limit: HEAD_REFRESH_COUNT,
      offset: 0,
      mediaTypes: [CAMERA_ROLL_MEDIA_TYPE.IMAGE],
    });

    const cache = getCameraRollPhotosCache();
    expect(cache.photos.map(asset => asset.id)).toEqual([
      'photo-new',
      'photo-2',
      'photo-1',
      'photo-3',
    ]);
    expect(cache.nextOffset).toBe(3);
    expect(cache.prefetchComplete).toBe(true);
  });

  it('re-reads the latest cache before writing after fetch completes', async () => {
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

    const refreshPromise = refreshCameraRollHead();

    setCameraRollPhotosCache({
      photos: [createAsset('photo-1'), createAsset('photo-tail')],
      nextOffset: 2,
      hasMore: true,
      prefetchComplete: true,
    });

    resolveFetch({
      assets: [createAsset('photo-new')],
      hasMore: true,
    });

    await refreshPromise;

    const cache = getCameraRollPhotosCache();
    expect(cache.photos.map(asset => asset.id)).toEqual(['photo-new', 'photo-1', 'photo-tail']);
    expect(cache.nextOffset).toBe(2);
  });
});
