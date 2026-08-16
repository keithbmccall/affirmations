import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { Asset } from 'expo-media-library';

export type LensNamedColor = {
  /** The color sampled from the photo; never a matcher’s replacement swatch. */
  hex: string;
  name?: string;
  nameDistance?: number;
  pantoneCode?: string;
  pantoneName?: string;
  pantoneDistance?: number;
};

export type LensDominantPaletteColors = {
  primaryColor: LensNamedColor;
  secondaryColor: LensNamedColor;
  tertiaryColor: LensNamedColor;
  quaternaryColor: LensNamedColor;
  quinaryColor: LensNamedColor;
  senaryColor: LensNamedColor;
  backgroundColor: LensNamedColor;
  detailColor: LensNamedColor;
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
  lensPointColor: LensNamedColor;
};

export type LensPalette = LensDominantPalette | LensPointPalette;

export type LensPalettesMap = Record<LensPalette['id'], LensPalette>;

export type LensPhotoCaptureContext =
  | {
      type: typeof COLOR_LENS_MODE.LENS_DOMINANT;
      paletteSnapshot: Record<keyof LensDominantPaletteColors, string>;
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
        lensPointColor: LensNamedColor;
      }
    | {
        type?: undefined;
        palette?: LensDominantPaletteColors;
        lensPointColor?: LensNamedColor;
      }
  );
