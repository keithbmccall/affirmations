import * as Notifications from 'expo-notifications';
import { NotificationSounds } from './notification-sounds';
import { NotificationData, NotificationIdentifier, NotificationWithData } from './types';

export const getAllScheduledNotifications = async () =>
  (await Notifications.getAllScheduledNotificationsAsync()) as NotificationWithData[];

type ScheduleNotification = (
  input: {
    title: string;
    body: string;
    date: Date;
  } & NotificationData
) => Promise<string>;
export const scheduleNotification: ScheduleNotification = async ({ title, body, data, date }) =>
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      sound: NotificationSounds.DEFAULT,
      body,
      data,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    },
  });

type CancelScheduledNotification = (identifier: NotificationIdentifier) => void;
export const cancelScheduledNotification: CancelScheduledNotification = identifier => {};
