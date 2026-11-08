export const FREEZE_MODE = {
  OFF: ['off', 'pause.fill'],
  ON: ['on', 'play.fill'],
} as const;

export const freezeModeOptions = Object.keys(FREEZE_MODE).map(key => ({
  label: key,
  icon: FREEZE_MODE[key as keyof typeof FREEZE_MODE][1],
  value: FREEZE_MODE[key as keyof typeof FREEZE_MODE][0],
}));

export type FreezeMode = (typeof FREEZE_MODE)[keyof typeof FREEZE_MODE];
