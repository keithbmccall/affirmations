export type PantoneSwatch = {
  code: string;
  name: string;
  hex: string;
  lab: { L: number; a: number; b: number };
};

/** Hex-keyed Pantone library (`#rrggbb` lowercase → swatch). */
export type PantoneHexLibrary = Record<string, PantoneSwatch>;
