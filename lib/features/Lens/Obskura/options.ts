export const OBSKURA_COLOR_MODE = {
  DEFAULT: 'default',
  TAME_RED: 'tame-red',
} as const;

export type ObskuraColorMode = (typeof OBSKURA_COLOR_MODE)[keyof typeof OBSKURA_COLOR_MODE];
