import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import type { InspectionAsset, LensPalette } from '@features/Lens/ColorPalette/types';
import type { Asset } from 'expo-media-library';

export const toInspectionAsset = (
  asset: Asset,
  lensPalette?: LensPalette
): InspectionAsset => {
  const base = {
    height: asset.height,
    width: asset.width,
    uri: asset.uri,
    mediaType: asset.mediaType,
    id: asset.id,
  };

  if (lensPalette?.type === COLOR_LENS_MODE.LENS_DOMINANT) {
    return {
      ...base,
      type: COLOR_LENS_MODE.LENS_DOMINANT,
      palette: lensPalette.palette,
    };
  }

  if (lensPalette?.type === COLOR_LENS_MODE.LENS_POINT) {
    return {
      ...base,
      type: COLOR_LENS_MODE.LENS_POINT,
      lensPointColor: lensPalette.lensPointColor,
    };
  }

  return base;
};
