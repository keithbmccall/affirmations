import { fetchColorNames } from '@api/fetchColorNames';
import { buildLensNamedColors } from '@features/Lens/ColorPalette/buildLensNamedColors';
import { matchPantoneColors } from '@features/Lens/ColorPalette/matchPantoneColors';
import type { LensNamedColor } from '@features/Lens/ColorPalette/types';

/**
 * Single enrichment entry point: Color Pizza + Pantone → LensNamedColor[].
 * Capture hexes are the source of truth (`hex` on each result).
 */
export const requestColorNames = async (hexes: string[]): Promise<LensNamedColor[]> => {
  const pantoneResponse = matchPantoneColors(hexes);

  let pizzaColors: Awaited<ReturnType<typeof fetchColorNames>>['colors'] = [];
  try {
    const response = await fetchColorNames(hexes);
    console.log('requestColorNames fetchColorNames', { hexes, response });
    pizzaColors = response.colors;
  } catch (error) {
    console.log('requestColorNames fetchColorNames error', { hexes, error });
  }

  console.log('requestColorNames matchPantoneColors', {
    hexes,
    pantoneResponse,
  });

  return buildLensNamedColors(hexes, pizzaColors, pantoneResponse.colors);
};
