import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { Asset } from 'expo-media-library';

export type LensDominantPaletteColors = {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  quaternaryColor: string;
  quinaryColor: string;
  senaryColor: string;
  backgroundColor: string;
  detailColor: string;
};

export type LensPaletteBase = {
  id: string;
  uri: string;
  mediaType: string;
};

export type LensDominantPalette = LensPaletteBase & {
  type: typeof COLOR_LENS_MODE.LENS_DOMINANT;
  palette: LensDominantPaletteColors;
};

export type LensPointPalette = LensPaletteBase & {
  type: typeof COLOR_LENS_MODE.LENS_POINT;
  lensPointColor: string;
};

export type LensPalette = LensDominantPalette | LensPointPalette;

export type LensPalettesMap = Record<LensPalette['id'], LensPalette>;

export type LensPhotoCaptureContext =
  | {
      type: typeof COLOR_LENS_MODE.LENS_DOMINANT;
      paletteSnapshot: LensDominantPaletteColors;
    }
  | {
      type: typeof COLOR_LENS_MODE.LENS_POINT;
      lensPointColor: string;
    };

export type InspectionAsset = LensPaletteBase & {
  height: Asset['height'];
  width: Asset['width'];
} & (
    | {
        type: typeof COLOR_LENS_MODE.LENS_DOMINANT;
        palette: LensDominantPaletteColors;
      }
    | {
        type: typeof COLOR_LENS_MODE.LENS_POINT;
        lensPointColor: string;
      }
    | {
        type?: undefined;
        palette?: LensDominantPaletteColors;
        lensPointColor?: string;
      }
  );
