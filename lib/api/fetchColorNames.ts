import { fetchJson } from '@api/fetchJson';
import { appHttpReferrer } from '@utils/identifiers';

const COLOR_PIZZA_V1 = 'https://api.color.pizza/v1/';

export type ColorPizzaColor = {
  name: string;
  hex: string;
  requestedHex: string;
  distance: number;
  luminance: number;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
};

export type ColorPizzaResponse = {
  paletteTitle: string;
  colors: ColorPizzaColor[];
};

export type FetchColorNamesOptions = {
  list?: string;
  noduplicates?: boolean;
};

export const normalizeHexValues = (hexes: string[]): string[] => {
  const seen = new Set<string>();
  const normalized: string[] = [];

  hexes.forEach(hex => {
    const value = hex.replace(/^#/, '').toLowerCase();
    if (!value || seen.has(value)) {
      return;
    }
    seen.add(value);
    normalized.push(value);
  });

  return normalized;
};

export const fetchColorNames = async (
  hexes: string[],
  options: FetchColorNamesOptions = {}
): Promise<ColorPizzaResponse> => {
  const { list = 'bestOf', noduplicates = true } = options;
  const values = normalizeHexValues(hexes).join(',');

  return fetchJson<ColorPizzaResponse>(COLOR_PIZZA_V1, {
    query: {
      values,
      list,
      noduplicates,
    },
    headers: {
      Accept: 'application/json',
      'X-Referrer': appHttpReferrer,
    },
  });
};
