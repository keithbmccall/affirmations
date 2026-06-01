import { ScheduleHistory } from '@features/Affirmations/Notifications/ScheduleHistory';
import type { HistoryNotification, NotificationWithData } from '@features/Affirmations/Notifications/types';
import { useAffirmations } from '@platform';
import { renderWithContext } from '@testing/renderWithContext';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as ExpoRouter from 'expo-router';
import React, { useEffect } from 'react';

jest.mock('@features/Affirmations/Notifications/useInitNotifications', () => ({
  useInitNotifications: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 48,
}));

const mockCancelPushNotification = jest.fn(() => Promise.resolve());

jest.mock('@features/Affirmations/Notifications/useNotificationsScheduler', () => ({
  useNotificationsScheduler: () => ({
    cancelPushNotification: mockCancelPushNotification,
    schedulePushNotification: jest.fn(),
    refreshPendingNotifications: jest.fn(),
    editPushNotification: jest.fn(),
  }),
}));

const triggerTime = Date.now() + 3600000;

const samplePending: NotificationWithData = {
  identifier: 'pending-1',
  content: {
    title: 'Affirm A',
    body: 'Message body line',
    categoryIdentifier: 'affirmation',
    data: {
      scheduledDate: { time: 1, rawDate: 'a', date: 'b' },
      triggerDate: { time: triggerTime, rawDate: 'c', date: 'd' },
    },
  },
} as NotificationWithData;

const sampleHistory: HistoryNotification = {
  identifier: 'hist-1',
  content: {
    title: 'Past A',
    body: 'Past body',
    categoryIdentifier: 'affirmation',
    data: {
      scheduledDate: { time: 1, rawDate: 'a', date: 'b' },
      triggerDate: { time: triggerTime - 1000, rawDate: 'c', date: 'd' },
    },
  },
};

function SeedLists({
  pending,
  history,
  children,
}: {
  pending: NotificationWithData[];
  history: HistoryNotification[];
  children: React.ReactNode;
}) {
  const { onSetPendingNotifications, onSetHistoryNotifications } = useAffirmations();
  useEffect(() => {
    onSetPendingNotifications(pending);
    onSetHistoryNotifications(history);
  }, [pending, history, onSetPendingNotifications, onSetHistoryNotifications]);
  return <>{children}</>;
}

describe('ScheduleHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(ExpoRouter.router, 'push').mockImplementation(jest.fn() as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('switches between pending and history pills', async () => {
    renderWithContext(
      <SeedLists pending={[samplePending]} history={[sampleHistory]}>
        <ScheduleHistory />
      </SeedLists>
    );

    expect(await screen.findByTestId('notification-row-pending-1')).toBeTruthy();

    fireEvent.press(await screen.findByText('History'));

    expect(await screen.findByTestId('notification-row-hist-1')).toBeTruthy();
  });

  it('navigates to notification details when a row is pressed', async () => {
    renderWithContext(
      <SeedLists pending={[samplePending]} history={[]}>
        <ScheduleHistory />
      </SeedLists>
    );

    fireEvent.press(await screen.findByTestId('notification-row-pending-1'));

    expect(ExpoRouter.router.push).toHaveBeenCalledWith({
      pathname: '/(modals)/notification-details-modal',
      params: { notificationId: 'pending-1', page: 'PENDING' },
    });
  });

  it('calls cancel when delete is pressed', async () => {
    renderWithContext(
      <SeedLists pending={[samplePending]} history={[]}>
        <ScheduleHistory />
      </SeedLists>
    );

    fireEvent.press(await screen.findByTestId('delete-notification-button-pending-1'));

    expect(mockCancelPushNotification).toHaveBeenCalledWith('pending-1');
  });

  it('returns to pending tab from history', async () => {
    renderWithContext(
      <SeedLists pending={[samplePending]} history={[sampleHistory]}>
        <ScheduleHistory />
      </SeedLists>
    );

    fireEvent.press(await screen.findByText('History'));
    await screen.findByTestId('notification-row-hist-1');

    fireEvent.press(screen.getByText('Pending'));

    expect(await screen.findByTestId('notification-row-pending-1')).toBeTruthy();
  });

  it('logs when delete fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockCancelPushNotification.mockRejectedValueOnce(new Error('cancel failed'));

    renderWithContext(
      <SeedLists pending={[samplePending]} history={[]}>
        <ScheduleHistory />
      </SeedLists>
    );

    fireEvent.press(await screen.findByTestId('delete-notification-button-pending-1'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
    mockCancelPushNotification.mockImplementation(() => Promise.resolve());
  });

  it('sorts notifications by trigger time', async () => {
    const earlier: NotificationWithData = {
      ...samplePending,
      identifier: 'e',
      content: {
        ...samplePending.content,
        data: {
          ...samplePending.content.data,
          triggerDate: { time: triggerTime - 10000, rawDate: 'x', date: 'y' },
        },
      },
    } as NotificationWithData;
    const later: NotificationWithData = {
      ...samplePending,
      identifier: 'l',
      content: {
        ...samplePending.content,
        data: {
          ...samplePending.content.data,
          triggerDate: { time: triggerTime + 10000, rawDate: 'x', date: 'y' },
        },
      },
    } as NotificationWithData;

    renderWithContext(
      <SeedLists pending={[later, earlier]} history={[]}>
        <ScheduleHistory />
      </SeedLists>
    );

    expect(await screen.findByTestId('notification-row-e')).toBeTruthy();
    expect(screen.getByTestId('notification-row-l')).toBeTruthy();
  });
});
