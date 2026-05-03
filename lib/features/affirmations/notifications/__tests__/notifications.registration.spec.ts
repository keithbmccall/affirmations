import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

type MockConstants = {
  expoConfig?: { extra?: { eas?: { projectId?: string }; projectId?: string } };
  easConfig?: { projectId?: string };
};

jest.mock('expo-constants', () => {
  const state: MockConstants = {};
  (globalThis as { __AFFIRMATIONS_EXPO_CONSTANTS__?: MockConstants }).__AFFIRMATIONS_EXPO_CONSTANTS__ =
    state;
  return {
    __esModule: true,
    default: state,
  };
});

const constantsState = (): MockConstants =>
  (globalThis as { __AFFIRMATIONS_EXPO_CONSTANTS__: MockConstants }).__AFFIRMATIONS_EXPO_CONSTANTS__;

const { registerForPushNotificationsAsync } = require('../notifications.registration') as typeof import('../notifications.registration');

describe('notifications.registration.ts', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    constantsState().expoConfig = undefined;
    constantsState().easConfig = undefined;
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ status: 'granted' } as never);
    jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValue({ status: 'granted' } as never);
    jest.mocked(Notifications.getExpoPushTokenAsync).mockResolvedValue({ data: 'push-token' } as never);
    jest.mocked(Notifications.setNotificationChannelAsync).mockResolvedValue(undefined as never);
  });

  afterEach(() => {
    alertSpy.mockRestore();
    jest.replaceProperty(Platform, 'OS', 'ios');
  });

  it('returns undefined on simulator (non-device)', async () => {
    jest.replaceProperty(Device, 'isDevice', false);

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeUndefined();
    expect(alertSpy).toHaveBeenCalledWith('Must use physical device for Push Notifications');
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('returns push token on device when permissions granted and project id resolves from expoConfig', async () => {
    jest.replaceProperty(Device, 'isDevice', true);
    jest.replaceProperty(Platform, 'OS', 'ios');
    constantsState().expoConfig = {
      extra: { eas: { projectId: 'from-extra-eas' } },
    };

    const token = await registerForPushNotificationsAsync();

    expect(token).toBe('push-token');
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: 'from-extra-eas',
    });
  });

  it('uses expoConfig.extra.projectId when eas path is absent', async () => {
    jest.replaceProperty(Device, 'isDevice', true);
    constantsState().expoConfig = {
      extra: { projectId: 'from-extra-root' },
    };

    const token = await registerForPushNotificationsAsync();

    expect(token).toBe('push-token');
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: 'from-extra-root',
    });
  });

  it('uses easConfig.projectId when present', async () => {
    jest.replaceProperty(Device, 'isDevice', true);
    constantsState().easConfig = { projectId: 'from-eas-config' };

    const token = await registerForPushNotificationsAsync();

    expect(token).toBe('push-token');
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: 'from-eas-config',
    });
  });

  it('uses fallback project id when config sources are empty', async () => {
    jest.replaceProperty(Device, 'isDevice', true);

    const token = await registerForPushNotificationsAsync();

    expect(token).toBe('push-token');
    expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({
      projectId: 'b6f11482-5e3a-4128-bc25-1c2468552783',
    });
  });

  it('alerts and returns when permission denied', async () => {
    jest.replaceProperty(Device, 'isDevice', true);
    jest.mocked(Notifications.getPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);
    jest.mocked(Notifications.requestPermissionsAsync).mockResolvedValue({ status: 'denied' } as never);

    const token = await registerForPushNotificationsAsync();

    expect(token).toBeUndefined();
    expect(alertSpy).toHaveBeenCalledWith('Failed to get push token for push notification!');
  });

  it('sets Android notification channel before permission flow', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    jest.replaceProperty(Device, 'isDevice', true);
    constantsState().expoConfig = {
      extra: { eas: { projectId: 'android-proj' } },
    };

    await registerForPushNotificationsAsync();

    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith(
      'myNotificationChannel',
      expect.objectContaining({
        name: 'A channel is needed for the permissions prompt to appear',
        importance: Notifications.AndroidImportance.MAX,
      })
    );
  });

  it('returns stringified error when getExpoPushTokenAsync throws', async () => {
    jest.replaceProperty(Device, 'isDevice', true);
    jest.mocked(Notifications.getExpoPushTokenAsync).mockRejectedValueOnce(new Error('token boom'));

    const token = await registerForPushNotificationsAsync();

    expect(String(token)).toContain('token boom');
  });
});
