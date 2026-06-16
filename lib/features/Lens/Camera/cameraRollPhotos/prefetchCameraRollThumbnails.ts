import { Image } from 'expo-image';
import type { Asset } from 'expo-media-library';

import { THUMBNAIL_PREFETCH_CONCURRENCY, THUMBNAIL_PREFETCH_PRIORITY_COUNT } from './constants';

const prefetchedUris = new Set<string>();

const prefetchUriBatch = async (uris: string[]): Promise<void> => {
  for (let index = 0; index < uris.length; index += THUMBNAIL_PREFETCH_CONCURRENCY) {
    const batch = uris.slice(index, index + THUMBNAIL_PREFETCH_CONCURRENCY);

    await Promise.all(
      batch.map(async uri => {
        try {
          const success = await Image.prefetch(uri, 'memory-disk');

          if (success) {
            prefetchedUris.add(uri);
          }
        } catch {
          // Skip thumbnails that cannot be prefetched.
        }
      })
    );
  }
};

const getUrisToPrefetch = (assets: Asset[]): string[] => {
  return assets
    .map(asset => asset.uri)
    .filter(uri => uri.length > 0 && !prefetchedUris.has(uri));
};

export const prefetchCameraRollThumbnails = async (assets: Asset[]): Promise<void> => {
  const urisToPrefetch = getUrisToPrefetch(assets);

  if (urisToPrefetch.length === 0) {
    return;
  }

  const priorityUris = urisToPrefetch.slice(0, THUMBNAIL_PREFETCH_PRIORITY_COUNT);
  const remainingUris = urisToPrefetch.slice(THUMBNAIL_PREFETCH_PRIORITY_COUNT);

  await prefetchUriBatch(priorityUris);

  if (remainingUris.length > 0) {
    void prefetchUriBatch(remainingUris);
  }
};

export const resetCameraRollThumbnailPrefetchState = () => {
  prefetchedUris.clear();
};
