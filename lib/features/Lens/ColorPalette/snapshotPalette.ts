import type { useColorLensPalette } from '@features/Lens/ColorPalette/useColorLensPalette';
import type { LensDominantPaletteColors } from '@features/Lens/ColorPalette/types';

type ColorLensPalette = ReturnType<typeof useColorLensPalette>['palette'];

export const snapshotPalette = (palette: ColorLensPalette): LensDominantPaletteColors => ({
  primaryColor: palette.primaryColor.value,
  secondaryColor: palette.secondaryColor.value,
  tertiaryColor: palette.tertiaryColor.value,
  quaternaryColor: palette.quaternaryColor.value,
  quinaryColor: palette.quinaryColor.value,
  senaryColor: palette.senaryColor.value,
  backgroundColor: palette.backgroundColor.value,
  detailColor: palette.detailColor.value,
});
