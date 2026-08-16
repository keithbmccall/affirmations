import { normalizeHexValues } from '@api/fetchColorNames';
import { deltaE76, hexToLab } from '@features/Lens/ColorPalette/colorDistanceLab';
import type {
  PantoneHexLibrary,
  PantoneSwatch,
} from '@features/Lens/ColorPalette/pantoneSwatch';

export type PantoneColorMatch = {
  requestedHex: string;
  name: string;
  code: string;
  hex: string;
  distance: number;
};

export type MatchPantoneColorsResult = {
  colors: PantoneColorMatch[];
};

type CachedPantoneLibrary = {
  library: PantoneHexLibrary;
  swatches: PantoneSwatch[];
};

let cachedLibrary: CachedPantoneLibrary | undefined;

const getPantoneLibrary = (): CachedPantoneLibrary => {
  if (cachedLibrary === undefined) {
    // Lazy-load: keep the ~2.3k-entry JSON off the critical path until first match.
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- deferred sync load of static palette
    const library = require('./data/pantonePalette.json') as PantoneHexLibrary;
    cachedLibrary = {
      library,
      swatches: Object.values(library),
    };
  }
  return cachedLibrary;
};

/** @internal test helper — clears the lazy palette cache. */
export const resetPantonePaletteCacheForTests = () => {
  cachedLibrary = undefined;
};

const toMatch = (requestedHex: string, swatch: PantoneSwatch, distance: number): PantoneColorMatch => ({
  requestedHex,
  name: swatch.name,
  code: swatch.code,
  hex: swatch.hex,
  distance,
});

const findNearestPantone = (
  normalizedHex: string,
  { library, swatches }: CachedPantoneLibrary
): PantoneColorMatch => {
  const requestedHex = `#${normalizedHex}`;
  const exact = library[requestedHex];
  if (exact !== undefined) {
    return toMatch(requestedHex, exact, 0);
  }

  const queryLab = hexToLab(normalizedHex);
  let best = swatches[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < swatches.length; i += 1) {
    const swatch = swatches[i];
    const distance = deltaE76(queryLab, swatch.lab);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = swatch;
    }
  }

  return toMatch(requestedHex, best, bestDistance);
};

/**
 * Nearest Pantone FHI/TCX approximations for the given hex colors.
 * Community approximate data (Margaret2) — not official Pantone.
 * Hex-keyed JSON library is lazy-loaded on first call and cached in memory.
 */
export const matchPantoneColors = (hexes: string[]): MatchPantoneColorsResult => {
  const values = normalizeHexValues(hexes);
  if (values.length === 0) {
    return { colors: [] };
  }

  const cached = getPantoneLibrary();
  if (cached.swatches.length === 0) {
    return { colors: [] };
  }

  return {
    colors: values.map(hex => findNearestPantone(hex, cached)),
  };
};
