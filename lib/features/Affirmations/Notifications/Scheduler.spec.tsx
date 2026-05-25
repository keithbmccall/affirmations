import { Scheduler } from '@features/Affirmations/Notifications/Scheduler';
import { renderWithContext } from '@testing/render-with-context';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as ExpoRouter from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';

jest.mock('@features/Affirmations/Notifications/useInitNotifications', () => ({
  useInitNotifications: jest.fn(),
}));

jest.mock('@utils/time', () => {
  const actual = jest.requireActual('@utils/time');
  const base = new Date('2030-06-01T12:00:00.000Z');
  return {
    ...actual,
    fiveMinutesFromNow: new Date(base.getTime() + 5 * 60 * 1000),
    twoYearsFromNow: new Date('2035-12-31T23:59:59.000Z'),
  };
});

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual('react');
  const { TouchableOpacity, Text, View } = jest.requireActual('react-native');
  return function MockDateTimePicker({
    onChange,
    testID,
  }: {
    onChange: (event: unknown, date?: Date) => void;
    testID?: string;
  }) {
    return (
      <View>
        <TouchableOpacity
          testID={testID}
          onPress={() => onChange({}, new Date('2030-10-15T15:30:00.000Z'))}
        >
          <Text>mock-datetime</Text>
        </TouchableOpacity>
        <TouchableOpacity testID={`${testID}-no-date`} onPress={() => onChange({}, undefined)}>
          <Text>mock-datetime-clear</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

const mockSchedulePushNotification = jest.fn(() => Promise.resolve('new-id'));
const mockRefreshPendingNotifications = jest.fn(() => Promise.resolve());
const mockCancelPushNotification = jest.fn(() => Promise.resolve());

jest.mock('@features/Affirmations/Notifications/useNotificationsScheduler', () => ({
  useNotificationsScheduler: () => ({
    schedulePushNotification: mockSchedulePushNotification,
    refreshPendingNotifications: mockRefreshPendingNotifications,
    cancelPushNotification: mockCancelPushNotification,
    editPushNotification: jest.fn(),
  }),
}));

describe('Scheduler', () => {
  let alertSpy: jest.SpyInstance;
  const mockRouterBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(ExpoRouter, 'useRouter').mockReturnValue({
      back: mockRouterBack,
      push: jest.fn(),
      replace: jest.fn(),
      setParams: jest.fn(),
      canGoBack: jest.fn(() => true),
    } as never);
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('shows validation errors for short title and short message', async () => {
    renderWithContext(<Scheduler enableRefreshControl={false} />);

    fireEvent.changeText(await screen.findByTestId('title-input'), 'ab');
    fireEvent.changeText(screen.getByTestId('message-input'), '1234');
    fireEvent.press(screen.getByTestId('date-time-picker-no-date'));
    fireEvent.press(screen.getByTestId('date-time-picker'));

    fireEvent.press(await screen.findByRole('button', { name: 'Schedule message' }));

    expect(await screen.findByText('Title needs to be at least 3 characters')).toBeTruthy();
    expect(await screen.findByText('Message needs to be at least 5 characters')).toBeTruthy();
  });

  it('schedules a notification and shows confirmation alert', async () => {
    renderWithContext(<Scheduler enableRefreshControl={false} />);

    fireEvent.changeText(await screen.findByTestId('title-input'), 'Hello');
    fireEvent.changeText(screen.getByTestId('message-input'), 'World message');
    fireEvent.press(screen.getByTestId('date-time-picker'));

    fireEvent.press(await screen.findByRole('button', { name: 'Schedule message' }));

    await waitFor(() => {
      expect(mockSchedulePushNotification).toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith(
        'Message Scheduled',
        expect.stringContaining('Hello'),
        [{ text: 'OK' }]
      );
    });
  });

  it('invokes submitProps.onSubmit when provided', async () => {
    const onSubmit = jest.fn();

    renderWithContext(
      <Scheduler
        enableRefreshControl={false}
        submitProps={{ submitText: 'Save', onSubmit }}
        initialTitle="Hello"
        initialBody="World long"
      />
    );

    fireEvent.press(screen.getByTestId('date-time-picker'));
    fireEvent.press(await screen.findByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Hello',
          body: 'World long',
        })
      );
    });
  });

  it('deletes notification and navigates back when notificationId is set', async () => {
    renderWithContext(
      <Scheduler enableRefreshControl={false} notificationId="to-delete" initialTitle="Titled" />
    );

    fireEvent.press(await screen.findByRole('button', { name: 'Delete Message' }));

    await waitFor(() => {
      expect(mockCancelPushNotification).toHaveBeenCalledWith('to-delete');
      expect(mockRouterBack).toHaveBeenCalled();
    });
  });

  it('refreshes pending list when refresh control runs', async () => {
    jest.useFakeTimers();
    renderWithContext(<Scheduler />);

    const scroll = await screen.findByTestId('scheduler-scroll');
    const refreshControl = scroll.props.refreshControl;
    expect(refreshControl).toBeTruthy();

    await act(async () => {
      await refreshControl.props.onRefresh();
    });
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(mockRefreshPendingNotifications).toHaveBeenCalled();
    jest.useRealTimers();
  });
});
