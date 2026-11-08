import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';

/** Stored palette kinds (includes historical lens-point entries; not a live camera mode). */
export const LENS_PALETTE_TYPE = {
  DOMINANT: COLOR_LENS_MODE.LENS_DOMINANT,
  POINT: 'lens-point',
} as const;

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
  type: typeof LENS_PALETTE_TYPE.DOMINANT;
  palette: LensDominantPaletteColors;
};

export type LensPointPalette = LensPaletteBase & {
  type: typeof LENS_PALETTE_TYPE.POINT;
  lensPointColor: LensNamedColor;
};

export type LensPalette = LensDominantPalette | LensPointPalette;

export type LensPalettesMap = Record<LensPalette['id'], LensPalette>;

export type LensPhotoCaptureContext = {
  type: typeof LENS_PALETTE_TYPE.DOMINANT;
  paletteSnapshot: Record<keyof LensDominantPaletteColors, string>;
};

export type InspectionAsset = LensPaletteBase & {
  height: number;
  width: number;
} & (
    | {
        type: typeof LENS_PALETTE_TYPE.DOMINANT;
        palette: LensDominantPaletteColors;
      }
    | {
        type: typeof LENS_PALETTE_TYPE.POINT;
        lensPointColor: LensNamedColor;
      }
    | {
        type?: undefined;
        palette?: LensDominantPaletteColors;
        lensPointColor?: LensNamedColor;
      }
  );

