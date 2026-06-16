import type { Asset } from 'expo-media-library';

export const mergePhotosAtHead = (existing: Asset[], head: Asset[]): Asset[] => {
  const headIds = new Set(head.map(asset => asset.id));
  const tail = existing.filter(asset => !headIds.has(asset.id));

  return [...head, ...tail];
};
