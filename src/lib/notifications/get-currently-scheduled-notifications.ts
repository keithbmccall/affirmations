import { NotificationWithData } from '@platform';
import * as Notifications from 'expo-notifications';

export const getCurrentlyScheduledNotifications = async () =>
  (await Notifications.getAllScheduledNotificationsAsync()) as unknown as NotificationWithData[];
