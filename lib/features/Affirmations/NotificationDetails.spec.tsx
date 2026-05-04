import { NotificationDetails, NotificationDetailsDisplay } from '@features/Affirmations/NotificationDetails';
import {
  SCHEDULE_HISTORY_PAGES,
  type HistoryNotification,
  type NotificationWithData,
} from '@features/Affirmations/Notifications/types';
import { useAffirmations } from '@platform';
import { renderWithContext } from '@testing/render-with-context';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as ExpoRouter from 'expo-router';
import React, { useLayoutEffect, useState } from 'react';

jest.mock('@features/Affirmations/Notifications/useInitNotifications', () => ({
  useInitNotifications: jest.fn(),
}));

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual('react');
  const { TouchableOpacity, Text } = jest.requireActual('react-native');
  return function MockDateTimePicker({
    onChange,
    testID,
  }: {
    onChange: (event: unknown, date?: Date) => void;
    testID?: string;
  }) {
    return (
      <TouchableOpacity
        testID={testID}
        onPress={() => onChange({}, new Date('2030-11-20T16:00:00.000Z'))}
      >
        <Text>mock-datetime</Text>
      </TouchableOpacity>
    );
  };
});

jest.mock('@utils/time', () => ({
  ...jest.requireActual('@utils/time'),
  getHumanReadableDate: jest.fn(() => ({
    month: 'July',
    day: 20,
    time: '4:00 PM',
    year: 2030,
  })),
}));

const mockEditPushNotification = jest.fn();

jest.mock('@features/Affirmations/Notifications/useNotificationsScheduler', () => ({
  useNotificationsScheduler: () => ({
    editPushNotification: mockEditPushNotification,
    cancelPushNotification: jest.fn(),
    schedulePushNotification: jest.fn(),
    refreshPendingNotifications: jest.fn(),
  }),
}));

const triggerTime = Date.now() + 7200000;

const samplePending: NotificationWithData = {
  identifier: 'detail-pending-1',
  content: {
    title: 'Edit me',
    body: 'Original body text',
    categoryIdentifier: 'affirmation',
    data: {
      scheduledDate: { time: 1, rawDate: 'a', date: 'b' },
      triggerDate: { time: triggerTime, rawDate: 'c', date: 'd' },
    },
  },
} as NotificationWithData;

const sampleHistory: HistoryNotification = {
  identifier: 'detail-hist-1',
  content: {
    title: 'Done item',
    body: 'History body',
    categoryIdentifier: 'affirmation',
    data: {
      scheduledDate: { time: 1, rawDate: 'a', date: 'b' },
      triggerDate: { time: triggerTime - 5000, rawDate: 'c', date: 'd' },
    },
  },
};

function PendingDetailsHost() {
  const { onSetPendingNotifications, onSetHistoryNotifications } = useAffirmations();
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    onSetPendingNotifications([samplePending]);
    onSetHistoryNotifications([]);
    setReady(true);
  }, [onSetPendingNotifications, onSetHistoryNotifications]);
  if (!ready) {
    return null;
  }
  return (
    <NotificationDetails notificationId="detail-pending-1" page={SCHEDULE_HISTORY_PAGES.PENDING} />
  );
}

const samplePendingNullTitle: NotificationWithData = {
  ...samplePending,
  content: {
    ...samplePending.content,
    title: undefined as never,
    body: undefined as never,
  },
} as NotificationWithData;

function PendingNullTitleHost() {
  const { onSetPendingNotifications, onSetHistoryNotifications } = useAffirmations();
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    onSetPendingNotifications([samplePendingNullTitle]);
    onSetHistoryNotifications([]);
    setReady(true);
  }, [onSetPendingNotifications, onSetHistoryNotifications]);
  if (!ready) {
    return null;
  }
  return (
    <NotificationDetails notificationId="detail-pending-1" page={SCHEDULE_HISTORY_PAGES.PENDING} />
  );
}

function HistoryDetailsHost() {
  const { onSetPendingNotifications, onSetHistoryNotifications } = useAffirmations();
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    onSetPendingNotifications([]);
    onSetHistoryNotifications([sampleHistory]);
    setReady(true);
  }, [onSetPendingNotifications, onSetHistoryNotifications]);
  if (!ready) {
    return null;
  }
  return (
    <NotificationDetails notificationId="detail-hist-1" page={SCHEDULE_HISTORY_PAGES.HISTORY} />
  );
}

describe('NotificationDetailsDisplay', () => {
  it('renders message and formatted schedule', () => {
    renderWithContext(
      <NotificationDetailsDisplay body="Hello there" date={new Date('2030-08-01T12:00:00.000Z')} />
    );

    expect(screen.getByText('Hello there')).toBeTruthy();
    expect(screen.getByText('July 20, 4:00 PM')).toBeTruthy();
    expect(screen.getByText('✓ Notification Delivered')).toBeTruthy();
  });
});

describe('NotificationDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(ExpoRouter.router, 'back').mockImplementation(jest.fn() as never);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows read-only delivered layout for history notifications', async () => {
    renderWithContext(<HistoryDetailsHost />);

    expect(await screen.findByTestId('notification-details-title')).toHaveTextContent('Done item');
    expect(screen.getByText('History body')).toBeTruthy();
    expect(screen.getByText('✓ Notification Delivered')).toBeTruthy();
  });

  it('coalesces missing title and body to empty strings', async () => {
    renderWithContext(<PendingNullTitleHost />);

    expect(await screen.findByTestId('notification-details-title')).toHaveTextContent('');
    expect(screen.getByTestId('title-input')).toHaveDisplayValue('');
    expect(screen.getByTestId('message-input')).toHaveDisplayValue('');
  });

  it('shows scheduler for pending notifications and submits edits', async () => {
    renderWithContext(<PendingDetailsHost />);

    expect(await screen.findByTestId('notification-details-title')).toHaveTextContent('Edit me');

    fireEvent.changeText(screen.getByTestId('title-input'), 'Updated title');
    fireEvent.press(screen.getByTestId('date-time-picker'));
    fireEvent.press(await screen.findByRole('button', { name: 'Edit Message' }));

    await waitFor(() => {
      expect(mockEditPushNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          identifier: 'detail-pending-1',
          title: 'Updated title',
        })
      );
    });
  });
});
