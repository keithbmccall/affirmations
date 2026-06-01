export const SKIA_COLOR_MODE = {
  DEFAULT: 'default',
  TAME_RED: 'tame-red',
} as const;

export type SkiaColorMode = (typeof SKIA_COLOR_MODE)[keyof typeof SKIA_COLOR_MODE];
