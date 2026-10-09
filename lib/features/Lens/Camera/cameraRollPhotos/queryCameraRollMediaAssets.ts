import {
  toCameraRollMediaAsset,
  type CameraRollMediaAsset,
} from './CameraRollMediaAsset';
import type { CameraRollMediaTypeFilter } from './cameraRollMediaTypes';
import { AssetField, MediaType, Query } from 'expo-media-library';

export type QueryCameraRollMediaAssetsParams = {
  limit: number;
  offset?: number;
  mediaTypes: CameraRollMediaTypeFilter[];
};

export type QueryCameraRollMediaAssetsResult = {
  assets: CameraRollMediaAsset[];
  hasMore: boolean;
};

export const queryCameraRollMediaAssets = async ({
  limit,
  offset = 0,
  mediaTypes,
}: QueryCameraRollMediaAssetsParams): Promise<QueryCameraRollMediaAssetsResult> => {
  let query = new Query()
    .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
    .limit(limit)
    .offset(offset);

  if (mediaTypes.length === 1) {
    query = query.eq(AssetField.MEDIA_TYPE, mediaTypes[0] as MediaType);
  } else if (mediaTypes.length > 1) {
    query = query.within(AssetField.MEDIA_TYPE, mediaTypes as MediaType[]);
  }

  const nativeAssets = await query.exe();
  const infos = await Promise.all(nativeAssets.map(asset => asset.getInfo()));
  const assets = infos.map(toCameraRollMediaAsset);

  return {
    assets,
    hasMore: assets.length === limit,
  };
};
