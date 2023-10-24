import { useActions, useAppState, useNotificationToken } from '@platform';
import * as Notifications from 'expo-notifications';
import { useCallback } from 'react';
import { useCurrentlyScheduledNotifications } from './use-currently-scheduled-notifications';

export type NotificationMessage = {
  title: string;
  body: string;
};
export const useNotifications = () => {
  const notificationToken = useNotificationToken();
  const { currentlyScheduledNotifications, historyNotifications } =
    useAppState();
  const { getCurrentlyScheduledNotifications } =
    useCurrentlyScheduledNotifications();
  const { onSetCurrentlyScheduledNotifications, onAddHistoryNotification } =
    useActions();

  const refreshCurrentlyScheduledNotifications = async () =>
    onSetCurrentlyScheduledNotifications(
      await getCurrentlyScheduledNotifications(),
    );
  const schedulePushNotification = useCallback(
    async (date: Date, title: string, message: string) => {
      if (notificationToken) {
        const time = date.getTime();
        const rawDate = date.toString();
        const stringDate = date.toDateString();
        const body = message;
        const timeData = {
          time,
          rawDate,
          date: stringDate,
        };
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: timeData,
          },
          trigger: {
            channelId: 'calendar',
            date,
          },
        });
        onAddHistoryNotification({
          identifier: `${title}_${rawDate}`,
          content: {
            title,
            body,
            data: timeData,
          },
        });

        await refreshCurrentlyScheduledNotifications();
      }
    },
    [notificationToken, Notifications],
  );

  return {
    currentlyScheduledNotifications,
    historyNotifications,
    schedulePushNotification,
  };
};
