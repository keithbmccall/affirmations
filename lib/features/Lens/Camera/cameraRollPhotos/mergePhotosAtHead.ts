import type { Asset } from 'expo-media-library';

/**
 * Merges a fresh library head into the cached photo list.
 *
 * Result order: `[...head, orphanedPrefixPhotos, existingBeyondHead]`, with no
 * duplicate ids from head. Items in `existing` beyond `head.length` are appended
 * via slice without scanning them for duplicates.
 *
 * @param existing - Cached photos, newest first; must be a contiguous prefix of the roll.
 * @param head - Latest head from the media library (newest first).
 * @returns Merged list, or the same `existing` reference when the head prefix is unchanged.
 *
 * @remarks Both arrays must be sorted by `creationTime` descending. If sort order
 * changes, the suffix-slice optimisation can produce incorrect results.
 */
export const mergePhotosAtHead = (existing: Asset[], head: Asset[]): Asset[] => {
  if (__DEV__ && existing.length >= 2) {
    console.assert(
      existing[0].creationTime >= existing[1].creationTime,
      'mergePhotosAtHead: existing must be sorted creationTime desc'
    );
  }

  if (head.length === 0) {
    return existing;
  }

  if (existing.length === 0) {
    return head;
  }

  const headLen = head.length;

  // Fast path: when the head prefix already matches, return existing by reference
  // so callers can skip cache writes and subscriber notifications.
  if (existing.length >= headLen) {
    let unchanged = true;

    // Loop 1: compare ids at each index in the overlapping prefix; exit early on first mismatch.
    for (let i = 0; i < headLen; i++) {
      if (existing[i].id !== head[i].id) {
        unchanged = false;
        break;
      }
    }

    if (unchanged) {
      return existing;
    }
  }

  // Index head ids for O(1) lookups while scanning the overlapping prefix of existing.
  const headIds = new Set<string>();

  // Loop 2: collect every head id once for O(1) membership checks in loop 3.
  for (const asset of head) {
    headIds.add(asset.id);
  }

  const prefixEnd = Math.min(headLen, existing.length);
  const prefixKept: Asset[] = [];

  // Loop 3: walk existing[0..prefixEnd); keep items absent from head (orphaned prefix photos).
  for (let i = 0; i < prefixEnd; i++) {
    const asset = existing[i];

    if (!headIds.has(asset.id)) {
      prefixKept.push(asset);
    }
  }

  // Tail beyond head length is unchanged; slice avoids scanning the full cached catalog.
  const suffix = existing.length > headLen ? existing.slice(headLen) : [];

  return [...head, ...prefixKept, ...suffix];
};
