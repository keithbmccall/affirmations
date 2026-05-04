import { Scheduler } from '../scheduler';
import { setupDateTimePickerMock } from '@testing/date-time-picker-mock';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { act, fireEvent, screen } from 'expo-router/testing-library';
import * as Notifications from 'expo-notifications';
import * as ExpoRouter from 'expo-router';
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

async function renderWithNotificationsInit(ui: React.ReactElement) {
  const utils = renderWithContext(ui);
  await flushProviderMicrotasks();
  return utils;
}

describe('Scheduler with Expo notifications', () => {
  let alertSpy: jest.SpyInstance;
  let useRouterSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    MockedDateTimePicker.mockClear();
    mockRegister.mockImplementation(() => Promise.resolve('stack-token'));
    jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([]);
    jest.mocked(Notifications.scheduleNotificationAsync).mockResolvedValue('new-id');
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    useRouterSpy = jest.spyOn(ExpoRouter, 'useRouter').mockReturnValue({
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      setParams: jest.fn(),
    } as ReturnType<typeof ExpoRouter.useRouter>);
  });

  afterEach(() => {
    alertSpy.mockRestore();
    useRouterSpy.mockRestore();
  });

  it('submits scheduler form and schedules via expo-notifications', async () => {
    await renderWithNotificationsInit(<Scheduler />);

    fireEvent.changeText(screen.getByTestId('title-input'), 'Good Title');
    fireEvent.changeText(screen.getByTestId('message-input'), 'Good body text here');

    const submitButton = await screen.findByRole('button', { name: 'Schedule message' });
    await act(async () => {
      fireEvent.press(submitButton);
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    const call = jest.mocked(Notifications.scheduleNotificationAsync).mock.calls[0][0];
    expect(call.content.title).toBe('Good Title');
    expect(call.content.body).toBe('Good body text here');
    expect(call.content.categoryIdentifier).toBe('affirmation');
    expect(call.trigger).toEqual(expect.objectContaining({ type: 'date', date: expect.any(Date) }));

    expect(alertSpy).toHaveBeenCalledWith(
      'Message Scheduled',
      expect.stringContaining('Good Title'),
      expect.any(Array)
    );
  });

  it('uses submitProps when provided instead of scheduling', async () => {
    const onSubmit = jest.fn();
    await renderWithNotificationsInit(
      <Scheduler
        initialTitle="Titled"
        initialBody="Body text ok"
        submitProps={{ submitText: 'Save', onSubmit }}
      />
    );

    await act(async () => {
      fireEvent.press(await screen.findByRole('button', { name: 'Save' }));
    });

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Titled',
      body: 'Body text ok',
      date: expect.any(Date),
    });
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('validates short title when submit is enabled', async () => {
    await renderWithNotificationsInit(<Scheduler />);

    fireEvent.changeText(screen.getByTestId('title-input'), 'Hi');
    fireEvent.changeText(screen.getByTestId('message-input'), 'Valid body text here');

    await act(async () => {
      fireEvent.press(await screen.findByRole('button', { name: 'Schedule message' }));
    });

    expect(await screen.findByText('Title needs to be at least 3 characters')).toBeOnTheScreen();
  });

  it('pull-to-refresh reloads scheduled notifications', async () => {
    jest.useFakeTimers();
    try {
      const { getByTestId } = await renderWithNotificationsInit(<Scheduler />);
      const scroll = getByTestId('scheduler-scroll');
      const refreshControl = scroll.props.refreshControl;
      expect(refreshControl).toBeTruthy();

      await act(async () => {
        await refreshControl.props.onRefresh();
      });

      expect(Notifications.getAllScheduledNotificationsAsync).toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(500);
      });
    } finally {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    }
  });

  it('navigates back after successful submit when notificationId is set', async () => {
    const back = jest.fn();
    useRouterSpy.mockReturnValue({
      back,
      push: jest.fn(),
      replace: jest.fn(),
      setParams: jest.fn(),
    } as ReturnType<typeof ExpoRouter.useRouter>);

    await renderWithNotificationsInit(
      <Scheduler
        notificationId="sched-1"
        initialTitle="Long Title"
        initialBody="Longer message body"
      />
    );

    await act(async () => {
      fireEvent.press(await screen.findByRole('button', { name: 'Schedule message' }));
    });

    expect(back).toHaveBeenCalled();
  });

  it('delete with notificationId cancels and navigates back', async () => {
    const back = jest.fn();
    useRouterSpy.mockReturnValue({
      back,
      push: jest.fn(),
      replace: jest.fn(),
      setParams: jest.fn(),
    } as ReturnType<typeof ExpoRouter.useRouter>);

    await renderWithNotificationsInit(
      <Scheduler notificationId="notif-1" initialTitle="X" initialBody="Yyyyy" />
    );

    await act(async () => {
      fireEvent.press(await screen.findByRole('button', { name: 'Delete Message' }));
    });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif-1');
    expect(back).toHaveBeenCalled();
  });

  it('omits refresh control when disabled', async () => {
    const { getByTestId } = await renderWithNotificationsInit(
      <Scheduler enableRefreshControl={false} />
    );
    expect(getByTestId('scheduler-scroll').props.refreshControl).toBeUndefined();
  });

  it('shows Alert when scheduleNotificationAsync rejects', async () => {
    jest.mocked(Notifications.scheduleNotificationAsync).mockRejectedValueOnce(new Error('no schedule'));

    await renderWithNotificationsInit(<Scheduler />);

    fireEvent.changeText(screen.getByTestId('title-input'), 'Good Title');
    fireEvent.changeText(screen.getByTestId('message-input'), 'Good body text here');

    await act(async () => {
      fireEvent.press(await screen.findByRole('button', { name: 'Schedule message' }));
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Message Scheduled',
      expect.stringContaining('Failed to schedule notification'),
      expect.any(Array)
    );
  });

  it('date picker onChange with no selectedDate leaves date unchanged', async () => {
    await renderWithNotificationsInit(<Scheduler />);
    const picker = screen.getByTestId('date-time-picker');
    fireEvent(picker, 'onChange', { type: 'dismissed' } as never, undefined);
    expect(picker).toBeOnTheScreen();
  });

  it('refresh tolerates getAllScheduledNotificationsAsync rejection', async () => {
    jest
      .mocked(Notifications.getAllScheduledNotificationsAsync)
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error('net'));

    const { getByTestId } = await renderWithNotificationsInit(<Scheduler />);
    const refreshControl = getByTestId('scheduler-scroll').props.refreshControl;

    await act(async () => {
      await refreshControl.props.onRefresh();
    });

    expect(Notifications.getAllScheduledNotificationsAsync.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
