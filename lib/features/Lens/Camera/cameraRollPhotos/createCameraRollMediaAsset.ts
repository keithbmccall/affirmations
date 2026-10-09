import { toCameraRollMediaAsset, type CameraRollMediaAsset } from './CameraRollMediaAsset';
import { Asset } from 'expo-media-library';

export const createCameraRollMediaAsset = async (
  localUri: string
): Promise<CameraRollMediaAsset> => {
  const asset = await Asset.create(localUri);
  const info = await asset.getInfo();
  return toCameraRollMediaAsset(info);
};
