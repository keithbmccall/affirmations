import type { ColorPizzaColor } from '@api/fetchColorNames';
import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { lensPaletteConfig } from '@features/Lens/ColorPalette/lensPaletteConfig';
import type { PantoneColorMatch } from '@features/Lens/ColorPalette/matchPantoneColors';
import type {
  LensNamedColor,
  LensPalette,
} from '@features/Lens/ColorPalette/types';

const toHexKey = (hex: string): string => hex.replace(/^#/, '').toLowerCase();

/**
 * Merges Color Pizza + Pantone results onto capture hexes.
 * `hex` is always the capture value (source of truth).
 */
export const buildLensNamedColors = (
  hexes: string[],
  colorPizzaColors: ColorPizzaColor[],
  pantoneColors: PantoneColorMatch[]
): LensNamedColor[] => {
  const pizzaByHex = new Map(
    colorPizzaColors.map(color => [toHexKey(color.requestedHex), color])
  );
  const pantoneByHex = new Map(
    pantoneColors.map(color => [toHexKey(color.requestedHex), color])
  );

  return hexes.map(hex => {
    const key = toHexKey(hex);
    const pizza = pizzaByHex.get(key);
    const pantone = pantoneByHex.get(key);

    const namedColor: LensNamedColor = { hex };
    if (pizza?.name !== undefined) {
      namedColor.name = pizza.name;
    }
    if (pizza?.distance !== undefined) {
      namedColor.nameDistance = pizza.distance;
    }
    if (pantone?.code !== undefined) {
      namedColor.pantoneCode = pantone.code;
    }
    if (pantone?.name !== undefined) {
      namedColor.pantoneName = pantone.name;
    }
    if (pantone?.distance !== undefined) {
      namedColor.pantoneDistance = pantone.distance;
    }
    return namedColor;
  });
};

export const getLensPaletteCaptureHexes = (palette: LensPalette): string[] => {
  if (palette.type === COLOR_LENS_MODE.LENS_POINT) {
    return [palette.lensPointColor.hex];
  }

  return lensPaletteConfig.colorPaletteKeys.map(key => palette.palette[key].hex);
};
