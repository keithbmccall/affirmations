export const COLOR_LENS_MODE = {
  DISABLED: 'disabled',
  LENS_DOMINANT: 'lens-dominant',
  LENS_POINT: 'lens-point',
} as const;

export type ColorLensMode = (typeof COLOR_LENS_MODE)[keyof typeof COLOR_LENS_MODE];

export const colorLensModeOptions: ColorLensMode[] = [
  COLOR_LENS_MODE.DISABLED,
  COLOR_LENS_MODE.LENS_DOMINANT,
  COLOR_LENS_MODE.LENS_POINT,
];

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
  const index = colorLensModeOptions.indexOf(mode);
  const nextIndex = index === -1 ? 0 : (index + 1) % colorLensModeOptions.length;
  return colorLensModeOptions[nextIndex];
}
