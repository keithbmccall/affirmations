import {
  THUMBNAIL_PREFETCH_CONCURRENCY,
  THUMBNAIL_PREFETCH_PRIORITY_COUNT,
} from '@features/Lens/Camera/cameraRollPhotos/constants';
import {
  prefetchCameraRollThumbnails,
  resetCameraRollThumbnailPrefetchState,
} from '@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollThumbnails';
import { Image } from 'expo-image';
import type { Asset } from 'expo-media-library';

jest.mock('expo-image', () => ({
  Image: {
    prefetch: jest.fn(() => Promise.resolve(true)),
  },
}));

const mockedImagePrefetch = Image.prefetch as jest.MockedFunction<typeof Image.prefetch>;

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

describe('prefetchCameraRollThumbnails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollThumbnailPrefetchState();
  });

  it('prefetches all thumbnail uris with memory-disk caching', async () => {
    const assets = Array.from({ length: THUMBNAIL_PREFETCH_PRIORITY_COUNT + 4 }, (_, index) =>
      createAsset(`photo-${index}`)
    );

    await prefetchCameraRollThumbnails(assets);

    await new Promise(resolve => {
      setTimeout(resolve, 0);
    });

    expect(mockedImagePrefetch).toHaveBeenCalledTimes(assets.length);
    expect(mockedImagePrefetch).toHaveBeenNthCalledWith(1, 'file:///photo-0.jpg', 'memory-disk');
    expect(mockedImagePrefetch).toHaveBeenCalledWith('file:///photo-21.jpg', 'memory-disk');
  });

  it('skips uris that were already prefetched', async () => {
    const assets = [createAsset('photo-1'), createAsset('photo-2')];

    await prefetchCameraRollThumbnails(assets);
    await prefetchCameraRollThumbnails(assets);

    expect(mockedImagePrefetch).toHaveBeenCalledTimes(2);
  });

  it('prefetches in bounded concurrency batches', async () => {
    const assets = Array.from({ length: THUMBNAIL_PREFETCH_CONCURRENCY + 2 }, (_, index) =>
      createAsset(`photo-${index}`)
    );

    await prefetchCameraRollThumbnails(assets);

    expect(mockedImagePrefetch).toHaveBeenCalledTimes(assets.length);
  });
});
