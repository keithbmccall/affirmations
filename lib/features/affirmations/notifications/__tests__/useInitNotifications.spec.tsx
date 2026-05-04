import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import * as Notifications from 'expo-notifications';
import React from 'react';
import { Platform, Text } from 'react-native';

const mockRegister = jest.fn(() => Promise.resolve('init-int-token'));
jest.mock('../notifications.registration', () => ({
  registerForPushNotificationsAsync: (...args: unknown[]) => mockRegister(...args),
}));

jest.mock('@storage/storage', () => ({
  ...jest.requireActual('@storage/storage'),
  loadData: jest.fn(() => Promise.resolve([])),
  saveData: jest.fn(),
}));

describe('use-init-notifications.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockResolvedValue('init-int-token');
    jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([]);
  });

  it('registers notification listeners and removes them on unmount', async () => {
    const removeReceived = jest.fn();
    const removeResponse = jest.fn();
    let onReceived: ((n: unknown) => void) | undefined;
    let onResponse: ((r: unknown) => void) | undefined;
    jest.mocked(Notifications.addNotificationReceivedListener).mockImplementation(cb => {
      onReceived = cb;
      return { remove: removeReceived };
    });
    jest.mocked(Notifications.addNotificationResponseReceivedListener).mockImplementation(cb => {
      onResponse = cb;
      return { remove: removeResponse };
    });

    const { unmount } = renderWithContext(<Text testID="init-child">ok</Text>);
    await flushProviderMicrotasks();

    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();

    onReceived?.({ request: { content: { title: 't' } } } as never);
    onResponse?.({ notification: { request: { content: {} } } } as never);

    unmount();

    expect(removeReceived).toHaveBeenCalled();
    expect(removeResponse).toHaveBeenCalled();
  });

  it('handles falsy Android channels without throwing', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    jest.mocked(Notifications.getNotificationChannelsAsync).mockResolvedValue(null as never);

    try {
      renderWithContext(<Text testID="android-null-channels">ok</Text>);
      await flushProviderMicrotasks();
      expect(Notifications.getNotificationChannelsAsync).toHaveBeenCalled();
    } finally {
      jest.replaceProperty(Platform, 'OS', 'ios');
    }
  });

  it('loads Android notification channels when Platform is android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    jest.mocked(Notifications.getNotificationChannelsAsync).mockResolvedValue([{ id: 'c1' }] as never);

    try {
      renderWithContext(<Text testID="android-init">ok</Text>);
      await flushProviderMicrotasks();

      expect(Notifications.getNotificationChannelsAsync).toHaveBeenCalled();
    } finally {
      jest.replaceProperty(Platform, 'OS', 'ios');
    }
  });
});
