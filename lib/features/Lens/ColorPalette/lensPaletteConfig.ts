import type { LensDominantPaletteColors } from '@features/Lens/ColorPalette/types';

export const lensPaletteConfig = {
  defaultColor: '#000000',
  colorPaletteKeys: [
    'primaryColor',
    'secondaryColor',
    'tertiaryColor',
    'quaternaryColor',
    'quinaryColor',
    'senaryColor',
    'backgroundColor',
    'detailColor',
  ] as const satisfies readonly (keyof LensDominantPaletteColors)[],
};
