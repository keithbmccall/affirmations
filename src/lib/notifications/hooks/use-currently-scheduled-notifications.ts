import { NotificationRequestWithData } from '@platform';
import * as Notifications from 'expo-notifications';

export const useCurrentlyScheduledNotifications = () => {
  const getCurrentlyScheduledNotifications = async () => {
    const currentlyScheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    return currentlyScheduledNotifications as unknown as NotificationRequestWithData[];
  };

  return {
    getCurrentlyScheduledNotifications,
  };
};
