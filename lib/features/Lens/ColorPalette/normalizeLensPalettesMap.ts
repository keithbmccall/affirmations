import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import type {
  LensDominantPaletteColors,
  LensNamedColor,
  LensPalette,
  LensPalettesMap,
} from '@features/Lens/ColorPalette/types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const normalizeLensNamedColor = (value: unknown): LensNamedColor | undefined => {
  if (typeof value === 'string') {
    return { hex: value };
  }
  if (!isRecord(value) || typeof value.hex !== 'string') {
    return undefined;
  }

  const { hex, name, nameDistance, pantoneCode, pantoneName, pantoneDistance } = value;
  if (
    (name !== undefined && typeof name !== 'string') ||
    (nameDistance !== undefined && typeof nameDistance !== 'number') ||
    (pantoneCode !== undefined && typeof pantoneCode !== 'string') ||
    (pantoneName !== undefined && typeof pantoneName !== 'string') ||
    (pantoneDistance !== undefined && typeof pantoneDistance !== 'number')
  ) {
    return undefined;
  }

  return { hex, name, nameDistance, pantoneCode, pantoneName, pantoneDistance };
};

const normalizeDominantPaletteColors = (
  value: unknown
): LensDominantPaletteColors | undefined => {
  if (!isRecord(value)) return undefined;

  const primaryColor = normalizeLensNamedColor(value.primaryColor);
  const secondaryColor = normalizeLensNamedColor(value.secondaryColor);
  const tertiaryColor = normalizeLensNamedColor(value.tertiaryColor);
  const quaternaryColor = normalizeLensNamedColor(value.quaternaryColor);
  const quinaryColor = normalizeLensNamedColor(value.quinaryColor);
  const senaryColor = normalizeLensNamedColor(value.senaryColor);
  const backgroundColor = normalizeLensNamedColor(value.backgroundColor);
  const detailColor = normalizeLensNamedColor(value.detailColor);

  if (
    primaryColor === undefined ||
    secondaryColor === undefined ||
    tertiaryColor === undefined ||
    quaternaryColor === undefined ||
    quinaryColor === undefined ||
    senaryColor === undefined ||
    backgroundColor === undefined ||
    detailColor === undefined
  ) {
    return undefined;
  }

  return {
    primaryColor,
    secondaryColor,
    tertiaryColor,
    quaternaryColor,
    quinaryColor,
    senaryColor,
    backgroundColor,
    detailColor,
  };
};

const normalizeLensPaletteEntry = (value: unknown): LensPalette | undefined => {
  if (!isRecord(value)) return undefined;

  const { id, uri, mediaType } = value;
  if (typeof id !== 'string' || typeof uri !== 'string' || typeof mediaType !== 'string') {
    return undefined;
  }

  if (value.type === COLOR_LENS_MODE.LENS_POINT) {
    const lensPointColor = normalizeLensNamedColor(value.lensPointColor);
    if (lensPointColor === undefined) return undefined;
    return {
      id,
      uri,
      mediaType,
      type: COLOR_LENS_MODE.LENS_POINT,
      lensPointColor,
    };
  }

  const palette = normalizeDominantPaletteColors(value.palette);
  if ((value.type === COLOR_LENS_MODE.LENS_DOMINANT || value.type === undefined) && palette) {
    return {
      id,
      uri,
      mediaType,
      type: COLOR_LENS_MODE.LENS_DOMINANT,
      palette,
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
