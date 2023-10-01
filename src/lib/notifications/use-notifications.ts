import { useActions, useAppState, useNotificationToken } from '@platform';
import * as Notifications from 'expo-notifications';
import { useCallback } from 'react';
import { useCurrentlyScheduledNotifications } from './use-currently-scheduled-notifications';

export type NotificationMessage = {
  title: string;
  body: string;
};
export const useNotifications = () => {
  const { currentlyScheduledNotifications } = useAppState();
  const notificationToken = useNotificationToken();
  const { getCurrentlyScheduledNotifications } =
    useCurrentlyScheduledNotifications();
  const { onSetCurrentlyScheduledNotifications } = useActions();

  const refreshCurrentlyScheduledNotifications = async () =>
    onSetCurrentlyScheduledNotifications(
      await getCurrentlyScheduledNotifications(),
    );
  const schedulePushNotification = useCallback(
    async (date: Date, title: string, message: string) => {
      if (notificationToken) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body: message,
            data: {
              time: date.getTime(),
              rawDate: date.toString(),
              date: date.toDateString(),
            },
          },
          trigger: {
            channelId: 'calendar',
            date,
          },
        });
        await refreshCurrentlyScheduledNotifications();
      }
    },
    [notificationToken, Notifications],
  );

  return {
    currentlyScheduledNotifications,
    schedulePushNotification,
  };
};
