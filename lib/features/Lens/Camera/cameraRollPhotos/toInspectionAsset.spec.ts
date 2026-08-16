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
  primaryColor: { hex: '#111111' },
  secondaryColor: { hex: '#222222' },
  tertiaryColor: { hex: '#333333' },
  quaternaryColor: { hex: '#444444' },
  quinaryColor: { hex: '#555555' },
  senaryColor: { hex: '#666666' },
  backgroundColor: { hex: '#777777' },
  detailColor: { hex: '#888888' },
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
      lensPointColor: { hex: '#AABBCC' },
    };

    expect(toInspectionAsset(asset, lensPalette)).toEqual({
      id: 'asset-1',
      uri: 'file:///asset-1.jpg',
      mediaType: 'photo',
      height: 200,
      width: 100,
      type: COLOR_LENS_MODE.LENS_POINT,
      lensPointColor: { hex: '#AABBCC' },
    });
  });
});
