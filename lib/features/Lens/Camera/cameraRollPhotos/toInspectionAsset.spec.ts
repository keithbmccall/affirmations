import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import type { LensPalette } from '@features/Lens/ColorPalette/types';
import type { Asset } from 'expo-media-library';
import { toInspectionAsset } from './toInspectionAsset';

const asset = {
  id: 'asset-1',
  uri: 'file:///asset-1.jpg',
  mediaType: 'photo',
  height: 200,
  width: 100,
} as Asset;

const dominantPalette = {
  primaryColor: '#111111',
  secondaryColor: '#222222',
  tertiaryColor: '#333333',
  quaternaryColor: '#444444',
  quinaryColor: '#555555',
  senaryColor: '#666666',
  backgroundColor: '#777777',
  detailColor: '#888888',
};

describe('toInspectionAsset', () => {
  it('returns base asset fields when lens palette is missing', () => {
    expect(toInspectionAsset(asset)).toEqual({
      id: 'asset-1',
      uri: 'file:///asset-1.jpg',
      mediaType: 'photo',
      height: 200,
      width: 100,
    });
  });

  it('passes through dominant palette type and colors', () => {
    const lensPalette: LensPalette = {
      id: 'asset-1',
      uri: 'file:///asset-1.jpg',
      mediaType: 'photo',
      type: COLOR_LENS_MODE.LENS_DOMINANT,
      palette: dominantPalette,
    };

    expect(toInspectionAsset(asset, lensPalette)).toEqual({
      id: 'asset-1',
      uri: 'file:///asset-1.jpg',
      mediaType: 'photo',
      height: 200,
      width: 100,
      type: COLOR_LENS_MODE.LENS_DOMINANT,
      palette: dominantPalette,
    });
  });

  it('passes through point type and lensPointColor', () => {
    const lensPalette: LensPalette = {
      id: 'asset-1',
      uri: 'file:///asset-1.jpg',
      mediaType: 'photo',
      type: COLOR_LENS_MODE.LENS_POINT,
      lensPointColor: '#AABBCC',
    };

    expect(toInspectionAsset(asset, lensPalette)).toEqual({
      id: 'asset-1',
      uri: 'file:///asset-1.jpg',
      mediaType: 'photo',
      height: 200,
      width: 100,
      type: COLOR_LENS_MODE.LENS_POINT,
      lensPointColor: '#AABBCC',
    });
  });
});
