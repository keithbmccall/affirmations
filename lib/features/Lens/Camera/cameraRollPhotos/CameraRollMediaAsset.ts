import type { AssetInfo } from 'expo-media-library';

/**
 * Sync plain-object media item for Lens camera-roll UI and cache.
 * Materialized from the Expo MediaLibrary `Asset` class via `getInfo()`.
 */
export type CameraRollMediaAsset = {
  id: string;
  uri: string;
  mediaType: string;
  width: number;
  height: number;
  creationTime: number;
  filename: string;
  duration: number;
  modificationTime: number;
};

export const toCameraRollMediaAsset = (info: AssetInfo): CameraRollMediaAsset => ({
  id: info.id,
  uri: info.uri,
  mediaType: info.mediaType,
  width: info.width,
  height: info.height,
  creationTime: info.creationTime ?? 0,
  filename: info.filename,
  duration: info.duration ?? 0,
  modificationTime: info.modificationTime ?? 0,
});
