import type { InspectionAsset, LensPalette } from '@features/Lens/ColorPalette/types';
import type { Asset } from 'expo-media-library';

export const toInspectionAsset = (
  asset: Asset,
  lensPalette?: LensPalette
): InspectionAsset => ({
  height: asset.height,
  width: asset.width,
  uri: asset.uri,
  mediaType: asset.mediaType,
  id: asset.id,
  palette: lensPalette?.palette,
});
