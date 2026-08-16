import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { lensPaletteConfig } from '@features/Lens/ColorPalette/lensPaletteConfig';
import type {
  LensDominantPaletteColors,
  LensPalette,
  LensPalettesMap,
} from '@features/Lens/ColorPalette/types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isDominantPaletteColors = (value: unknown): value is LensDominantPaletteColors => {
  if (!isRecord(value)) return false;

  return lensPaletteConfig.colorPaletteKeys.every(key => typeof value[key] === 'string');
};

const normalizeLensPaletteEntry = (value: unknown): LensPalette | undefined => {
  if (!isRecord(value)) return undefined;

  const { id, uri, mediaType } = value;
  if (typeof id !== 'string' || typeof uri !== 'string' || typeof mediaType !== 'string') {
    return undefined;
  }

  if (value.type === COLOR_LENS_MODE.LENS_POINT && typeof value.lensPointColor === 'string') {
    return {
      id,
      uri,
      mediaType,
      type: COLOR_LENS_MODE.LENS_POINT,
      lensPointColor: value.lensPointColor,
    };
  }

  if (
    (value.type === COLOR_LENS_MODE.LENS_DOMINANT || value.type === undefined) &&
    isDominantPaletteColors(value.palette)
  ) {
    return {
      id,
      uri,
      mediaType,
      type: COLOR_LENS_MODE.LENS_DOMINANT,
      palette: value.palette,
    };
  }

  return undefined;
};

export const normalizeLensPalettesMap = (raw: unknown): LensPalettesMap => {
  if (!isRecord(raw)) return {};

  const normalized: LensPalettesMap = {};

  for (const entry of Object.values(raw)) {
    const lensPalette = normalizeLensPaletteEntry(entry);
    if (lensPalette === undefined) continue;
    normalized[lensPalette.id] = lensPalette;
  }

  return normalized;
};
