export const COLOR_LENS_MODE = {
  DISABLED: 'disabled',
  LENS_DOMINANT: 'lens-dominant',
  LENS_POINT: 'lens-point',
} as const;

export type ColorLensMode = (typeof COLOR_LENS_MODE)[keyof typeof COLOR_LENS_MODE];

/** Cycle order for the color-lens toggle. */
export const colorLensModeOrder: ColorLensMode[] = [
  COLOR_LENS_MODE.DISABLED,
  COLOR_LENS_MODE.LENS_DOMINANT,
  COLOR_LENS_MODE.LENS_POINT,
];

/** Per-mode UI config, keyed by mode value (same access pattern as `gridModeOptions[gridMode]`). */
export const colorLensModeOptions = {
  [COLOR_LENS_MODE.DISABLED]: { icon: 'swatchpalette' },
  [COLOR_LENS_MODE.LENS_DOMINANT]: { icon: 'swatchpalette.fill' },
  [COLOR_LENS_MODE.LENS_POINT]: { icon: 'scope' },
} as const;

export function isColorLensActive(mode: ColorLensMode): boolean {
  return mode !== COLOR_LENS_MODE.DISABLED;
}

export function isColorLensDominant(mode: ColorLensMode): boolean {
  return mode === COLOR_LENS_MODE.LENS_DOMINANT;
}

export function isColorLensPoint(mode: ColorLensMode): boolean {
  return mode === COLOR_LENS_MODE.LENS_POINT;
}

export function nextColorLensMode(mode: ColorLensMode): ColorLensMode {
  const index = colorLensModeOrder.indexOf(mode);
  const nextIndex = index === -1 ? 0 : (index + 1) % colorLensModeOrder.length;
  return colorLensModeOrder[nextIndex];
}
