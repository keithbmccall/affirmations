import * as Notifications from 'expo-notifications';

export const getCurrentlyScheduledNotifications = async () =>
  await Notifications.getAllScheduledNotificationsAsync();
