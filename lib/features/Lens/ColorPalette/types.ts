import { Asset } from 'expo-media-library';

export type LensPalette = {
  id: string;
  uri: string;
  mediaType: string;
  palette: {
    primaryColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    quaternaryColor: string;
    quinaryColor: string;
    senaryColor: string;
    backgroundColor: string;
    detailColor: string;
  };
};

export type LensPalettesMap = Record<LensPalette['id'], LensPalette>;

export type InspectionAsset = Omit<LensPalette, 'palette'> & {
  palette?: LensPalette['palette'];
  height: Asset['height'];
  width: Asset['width'];
};
