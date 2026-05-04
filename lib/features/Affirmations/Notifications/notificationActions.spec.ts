import * as Notifications from 'expo-notifications';
import { NotificationSounds } from './NotificationSounds';
import {
  cancelScheduledNotification,
  getAllScheduledNotifications,
  scheduleNotification,
} from './notificationActions';

describe('notificationActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getAllScheduledNotifications delegates to expo-notifications', async () => {
    const mockList = [{ identifier: 'a' }] as never;
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(mockList);

    const result = await getAllScheduledNotifications();

    expect(Notifications.getAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockList);
  });

  it('scheduleNotification passes content and date trigger', async () => {
    const date = new Date('2030-06-15T12:00:00.000Z');
    const data = {
      scheduledDate: { time: 1, rawDate: '', date: '' },
      triggerDate: { time: date.getTime(), rawDate: date.toString(), date: date.toDateString() },
    };

    await scheduleNotification({
      title: 'T',
      body: 'B',
      data,
      date,
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: 'T',
        sound: NotificationSounds.DEFAULT,
        body: 'B',
        data,
        categoryIdentifier: 'affirmation',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  });

  it('cancelScheduledNotification delegates to expo-notifications', async () => {
    await cancelScheduledNotification('id-1');

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('id-1');
  });
});
