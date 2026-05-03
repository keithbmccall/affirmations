/** EAS project id used when requesting an Expo push token (see Expo push docs). */
export const FALLBACK_EAS_PROJECT_ID = 'b6f11482-5e3a-4128-bc25-1c2468552783';

type ConstantsShape = {
  expoConfig?: { extra?: { eas?: { projectId?: string }; projectId?: string } };
  easConfig?: { projectId?: string };
};

/** Resolves project id from Expo config; returns null when no non-empty source is set. */
export function resolveExpoProjectId(constants: ConstantsShape | null | undefined): string | null {
  if (!constants) {
    return null;
  }
  const sources = [
    constants.expoConfig?.extra?.eas?.projectId,
    constants.easConfig?.projectId,
    constants.expoConfig?.extra?.projectId,
  ];

  for (const source of sources) {
    if (source) {
      return source;
    }
  }

  return null;
}
