import { ScheduleHistory } from '../schedule-history';
import { setupDateTimePickerMock } from '@testing/date-time-picker-mock';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { act, fireEvent, screen } from 'expo-router/testing-library';
import * as Notifications from 'expo-notifications';
import React from 'react';
import { Alert } from 'react-native';

jest.mock('@react-navigation/bottom-tabs', () => ({
  ...jest.requireActual('@react-navigation/bottom-tabs'),
  useBottomTabBarHeight: jest.fn(() => 80),
}));

jest.mock('@react-native-community/datetimepicker');

const MockedDateTimePicker = setupDateTimePickerMock();

const mockRegister = jest.fn(() => Promise.resolve('stack-token'));
jest.mock('../../notifications.registration', () => ({
  registerForPushNotificationsAsync: (...args: unknown[]) => mockRegister(...args),
}));

jest.mock('@storage/storage', () => ({
  ...jest.requireActual('@storage/storage'),
  loadData: jest.fn(() => Promise.resolve([])),
  saveData: jest.fn(),
}));

const pendingOne = {
  identifier: 'pending-1',
  content: {
    title: 'Row One',
    body: 'Body one text',
    data: {
      triggerDate: { time: Date.now() + 3_600_000 },
    },
  },
};

async function renderWithNotificationsInit(ui: React.ReactElement) {
  const utils = renderWithContext(ui);
  await flushProviderMicrotasks();
  return utils;
}

describe('ScheduleHistory delete (Expo cancel)', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    MockedDateTimePicker.mockClear();
    mockRegister.mockImplementation(() => Promise.resolve('stack-token'));
    jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([]);
    jest.mocked(Notifications.scheduleNotificationAsync).mockResolvedValue('new-id');
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('schedule history delete calls cancelScheduledNotificationAsync', async () => {
    jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([pendingOne] as never);
    await renderWithNotificationsInit(<ScheduleHistory />);

    await act(async () => {
      fireEvent.press(await screen.findByTestId('delete-notification-button-pending-1'));
    });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('pending-1');
  });

  it('schedule history delete tolerates cancelScheduledNotificationAsync rejection', async () => {
    jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([pendingOne] as never);
    jest.mocked(Notifications.cancelScheduledNotificationAsync).mockRejectedValueOnce(new Error('x'));

    await renderWithNotificationsInit(<ScheduleHistory />);

    await act(async () => {
      fireEvent.press(await screen.findByTestId('delete-notification-button-pending-1'));
    });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('pending-1');
  });
});
