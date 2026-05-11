import { catchError } from '@utils/helpers';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import {
  cancelScheduledNotification,
  getAllScheduledNotifications,
  scheduleNotification,
} from './notificationActions';
import { useNotificationsScheduler } from './useNotificationsScheduler';

const mockOnSetPendingNotifications = jest.fn();
const mockOnAddHistoryNotification = jest.fn();
const mockOnRemoveHistoryNotification = jest.fn();

jest.mock('@platform', () => {
  const actual = jest.requireActual('@platform') as Record<string, unknown>;
  return {
    ...actual,
    useAffirmations: () => ({
      onSetPendingNotifications: mockOnSetPendingNotifications,
      onAddHistoryNotification: mockOnAddHistoryNotification,
      onRemoveHistoryNotification: mockOnRemoveHistoryNotification,
    }),
  };
});

jest.mock('./notificationActions', () => ({
  getAllScheduledNotifications: jest.fn(),
  scheduleNotification: jest.fn(),
  cancelScheduledNotification: jest.fn(),
}));

jest.mock('@utils/helpers', () => ({
  ...jest.requireActual('@utils/helpers'),
  catchError: jest.fn(),
}));

describe('useNotificationsScheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getAllScheduledNotifications).mockResolvedValue([]);
    jest.mocked(scheduleNotification).mockResolvedValue('scheduled-id');
    jest.mocked(cancelScheduledNotification).mockResolvedValue(undefined);
  });

  it('refreshPendingNotifications loads pending list and updates context', async () => {
    const list = [{ identifier: 'n1' }] as never;
    jest.mocked(getAllScheduledNotifications).mockResolvedValueOnce(list);

    const { result } = renderHook(() => useNotificationsScheduler());

    await act(async () => {
      await result.current.refreshPendingNotifications();
    });

    expect(getAllScheduledNotifications).toHaveBeenCalledTimes(1);
    expect(mockOnSetPendingNotifications).toHaveBeenCalledWith(list);
  });

  it('refreshPendingNotifications calls catchError when getAllScheduledNotifications fails', async () => {
    jest.mocked(getAllScheduledNotifications).mockRejectedValueOnce(new Error('network'));

    const { result } = renderHook(() => useNotificationsScheduler());

    await act(async () => {
      await result.current.refreshPendingNotifications();
    });

    expect(catchError).toHaveBeenCalledWith(
      expect.any(Error),
      'Failed to refresh pending notifications',
      'refreshPendingNotifications'
    );
    expect(mockOnSetPendingNotifications).not.toHaveBeenCalled();
  });

  it('schedulePushNotification schedules, adds history, refreshes pending, and returns identifier', async () => {
    jest.mocked(scheduleNotification).mockResolvedValueOnce('new-scheduled-id');

    const { result } = renderHook(() => useNotificationsScheduler());
    const date = new Date('2031-03-10T09:00:00.000Z');

    let id: string | undefined;
    await act(async () => {
      id = await result.current.schedulePushNotification({
        title: 'Morning',
        body: 'Affirm yourself',
        date,
      });
    });

    expect(id).toBe('new-scheduled-id');
    expect(scheduleNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Morning',
        body: 'Affirm yourself',
        date,
        data: {
          scheduledDate: expect.objectContaining({
            time: expect.any(Number),
            rawDate: expect.any(String),
            date: expect.any(String),
          }),
          triggerDate: expect.objectContaining({
            time: date.getTime(),
            rawDate: date.toString(),
            date: date.toDateString(),
          }),
        },
      })
    );
    expect(mockOnAddHistoryNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'new-scheduled-id',
        content: expect.objectContaining({
          title: 'Morning',
          body: 'Affirm yourself',
          categoryIdentifier: 'affirmation',
          data: expect.objectContaining({
            triggerDate: expect.objectContaining({
              time: date.getTime(),
            }),
          }),
        }),
      })
    );
    await waitFor(() => {
      expect(getAllScheduledNotifications).toHaveBeenCalled();
    });
  });

  it('schedulePushNotification calls catchError and returns error message when scheduling fails', async () => {
    jest.mocked(scheduleNotification).mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useNotificationsScheduler());
    const date = new Date('2031-03-10T09:00:00.000Z');

    let id: string | undefined;
    await act(async () => {
      id = await result.current.schedulePushNotification({
        title: 'T',
        body: 'B',
        date,
      });
    });

    expect(id).toContain('Failed to schedule notification');
    expect(id).toContain('T');
    expect(id).toContain('B');
    expect(catchError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.stringContaining('Failed to schedule notification'),
      'schedulePushNotification'
    );
    expect(mockOnAddHistoryNotification).not.toHaveBeenCalled();
  });

  it('cancelPushNotification cancels, removes history, and refreshes pending', async () => {
    const { result } = renderHook(() => useNotificationsScheduler());

    await act(async () => {
      await result.current.cancelPushNotification('old-id');
    });

    expect(cancelScheduledNotification).toHaveBeenCalledWith('old-id');
    expect(mockOnRemoveHistoryNotification).toHaveBeenCalledWith('old-id');
    expect(getAllScheduledNotifications).toHaveBeenCalled();
  });

  it('cancelPushNotification calls catchError when cancel fails', async () => {
    jest.mocked(cancelScheduledNotification).mockRejectedValueOnce(new Error('no'));

    const { result } = renderHook(() => useNotificationsScheduler());

    await act(async () => {
      await result.current.cancelPushNotification('x');
    });

    expect(catchError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.stringContaining('Failed to cancel notification'),
      'cancelPushNotification'
    );
  });

  it('editPushNotification schedules new notification then cancels the old identifier', async () => {
    jest.mocked(scheduleNotification).mockResolvedValueOnce('edited-id');

    const { result } = renderHook(() => useNotificationsScheduler());
    const date = new Date('2032-01-01T12:00:00.000Z');

    let id: string | undefined;
    await act(async () => {
      id = await result.current.editPushNotification({
        identifier: 'prev-id',
        title: 'New title',
        body: 'New body',
        date,
      });
    });

    expect(id).toBe('edited-id');
    expect(scheduleNotification).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New title', body: 'New body', date })
    );
    expect(cancelScheduledNotification).toHaveBeenCalledWith('prev-id');
    expect(mockOnRemoveHistoryNotification).toHaveBeenCalledWith('prev-id');
  });
});
