import { FALLBACK_EAS_PROJECT_ID, resolveExpoProjectId } from '../expo-push-project-id';

describe('resolveExpoProjectId', () => {
  it('returns null when constants is nullish', () => {
    expect(resolveExpoProjectId(null)).toBeNull();
    expect(resolveExpoProjectId(undefined)).toBeNull();
  });

  it('returns null when all sources are empty', () => {
    expect(resolveExpoProjectId({ expoConfig: {}, easConfig: {} })).toBeNull();
  });

  it('prefers extra.eas.projectId', () => {
    expect(
      resolveExpoProjectId({
        expoConfig: { extra: { eas: { projectId: 'eas-first' }, projectId: 'extra-root' } },
        easConfig: { projectId: 'eas-config' },
      })
    ).toBe('eas-first');
  });

  it('falls back to easConfig.projectId', () => {
    expect(
      resolveExpoProjectId({
        expoConfig: { extra: {} },
        easConfig: { projectId: 'from-eas' },
      })
    ).toBe('from-eas');
  });

  it('falls back to extra.projectId', () => {
    expect(
      resolveExpoProjectId({
        expoConfig: { extra: { projectId: 'extra-only' } },
      })
    ).toBe('extra-only');
  });
});

describe('FALLBACK_EAS_PROJECT_ID', () => {
  it('matches registration fallback constant', () => {
    expect(FALLBACK_EAS_PROJECT_ID).toMatch(/^[0-9a-f-]{36}$/i);
  });
});
