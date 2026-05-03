import { NotificationDetails } from '../notification-details';
import type { NotificationDetailsParams } from '@features/affirmations/notifications/types';
import { useAffirmations } from '@platform';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { loadData, StorageDevice } from '@storage/storage';
import { act, fireEvent, screen } from 'expo-router/testing-library';
import * as Notifications from 'expo-notifications';
import * as ExpoRouter from 'expo-router';
import React, { useMemo } from 'react';
import { Text } from 'react-native';

/** Avoid first paint before init has populated lists (NotificationDetails assumes notification exists). */
function NotificationDetailsWhenReady(props: NotificationDetailsParams) {
  const {
    notifications: { pendingNotifications, historyNotifications },
  } = useAffirmations();
  const isHistory = props.page === 'HISTORY';
  const list = isHistory ? historyNotifications : pendingNotifications;
  const ready = useMemo(
    () => list.some(n => n.identifier === props.notificationId),
    [list, props.notificationId]
  );
  if (!ready) {
    return <Text testID="notification-details-loading">loading</Text>;
  }
  return <NotificationDetails {...props} />;
}

jest.mock('@react-native-community/datetimepicker');

jest.mock('@react-navigation/bottom-tabs', () => ({
  ...jest.requireActual('@react-navigation/bottom-tabs'),
  useBottomTabBarHeight: jest.fn(() => 80),
}));

const mockRegister = jest.fn(() => Promise.resolve('details-token'));
jest.mock('@features/affirmations/notifications/notifications.registration', () => ({
  registerForPushNotificationsAsync: (...args: unknown[]) => mockRegister(...args),
}));

jest.mock('@storage/storage', () => {
  const actual = jest.requireActual('@storage/storage');
  return {
    ...actual,
    loadData: jest.fn(() => Promise.resolve([])),
    saveData: jest.fn(),
  };
});

const pendingEdit = {
  identifier: 'edit-pending-1',
  content: {
    title: 'Original Title',
    body: 'Original body text here',
    data: {
      triggerDate: { time: Date.now() + 3_600_000 },
    },
  },
};

describe('notification-details.tsx', () => {
  let useRouterSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRegister.mockResolvedValue('details-token');
    jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([pendingEdit] as never);
    jest.mocked(Notifications.scheduleNotificationAsync).mockResolvedValue('new-from-edit');
    useRouterSpy = jest.spyOn(ExpoRouter, 'useRouter').mockReturnValue({
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      setParams: jest.fn(),
    } as ReturnType<typeof ExpoRouter.useRouter>);
  });

  afterEach(() => {
    useRouterSpy.mockRestore();
  });

  it('pending tab shows scheduler and edit submit schedules then cancels original', async () => {
    renderWithContext(<NotificationDetailsWhenReady notificationId="edit-pending-1" page="PENDING" />);
    await flushProviderMicrotasks();

    expect(await screen.findByTestId('notification-details-title')).toBeOnTheScreen();

    fireEvent.changeText(screen.getByTestId('title-input'), 'Updated Title');
    fireEvent.changeText(screen.getByTestId('message-input'), 'Updated body text ok');

    await act(async () => {
      fireEvent.press(await screen.findByRole('button', { name: 'Edit Message' }));
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('edit-pending-1');
  });

  it('pending edit handles cancel failure after successful schedule', async () => {
    jest.mocked(Notifications.scheduleNotificationAsync).mockResolvedValue('replacement-id');
    jest.mocked(Notifications.cancelScheduledNotificationAsync).mockRejectedValueOnce(
      new Error('cancel failed')
    );

    renderWithContext(<NotificationDetailsWhenReady notificationId="edit-pending-1" page="PENDING" />);
    await flushProviderMicrotasks();

    fireEvent.changeText(screen.getByTestId('title-input'), 'Updated Title');
    fireEvent.changeText(screen.getByTestId('message-input'), 'Updated body text ok');

    await act(async () => {
      fireEvent.press(await screen.findByRole('button', { name: 'Edit Message' }));
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('edit-pending-1');
  });

  it('history tab shows read-only details', async () => {
    const history = [
      {
        identifier: 'hist-1',
        content: {
          title: undefined as unknown as string,
          body: undefined as unknown as string,
          data: { triggerDate: { time: Date.now() - 3_600_000 } },
        },
      },
    ];
    jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([]);
    jest.mocked(loadData).mockImplementation((key: string) => {
      if (key === StorageDevice.HISTORY_NOTIFICATIONS) {
        return Promise.resolve(history);
      }
      return Promise.resolve([]);
    });

    renderWithContext(<NotificationDetailsWhenReady notificationId="hist-1" page="HISTORY" />);
    await flushProviderMicrotasks();

    expect(await screen.findByTestId('notification-details-title')).toHaveTextContent('');
    expect(await screen.findByText('✓ Notification Delivered')).toBeOnTheScreen();
    expect(await screen.findByText(/Notification Delivered/)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Edit Message' })).not.toBeOnTheScreen();
  });
});
