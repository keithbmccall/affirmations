import {
  NotificationIdentifier,
  useActions,
  useAppState,
  useNotificationToken,
} from '@platform';
import * as Notifications from 'expo-notifications';
import { useCallback } from 'react';
import { NotificationSounds } from '../notification-sounds';
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
  const {
    onAddHistoryNotification,
    onRemoveHistoryNotification,
    onSetCurrentlyScheduledNotifications,
  } = useActions();

  const refreshCurrentlyScheduledNotifications = async () =>
    onSetCurrentlyScheduledNotifications(
      await getCurrentlyScheduledNotifications(),
    );
  const schedulePushNotification = useCallback(
    async (date: Date, title: string, message: string, refresh = true) => {
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

        try {
          const identifier = await Notifications.scheduleNotificationAsync({
            content: {
              title,
              sound: NotificationSounds.DEFAULT,
              body,
              data: timeData,
            },
            trigger: {
              channelId: 'calendar',
              date,
            },
          });
          onAddHistoryNotification({
            identifier,
            content: {
              title,
              body,
              data: timeData,
            },
          });
          if (refresh) {
            await refreshCurrentlyScheduledNotifications();
          }
        } catch (e) {
          console.log(
            `Failed to schedule notification with title of: ${title} and message of: ${message}!!!`,
            e,
          );
        }
      }
    },
    [notificationToken, Notifications],
  );

  const cancelPushNotification = useCallback(
    async (identifier: string, refresh = true) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
        onRemoveHistoryNotification(identifier);
        if (refresh) {
          await refreshCurrentlyScheduledNotifications();
        }
      } catch (e) {
        console.log(
          `Failed to cancel notification with identifier: ${identifier}!!!`,
          e,
        );
      }
    },
    [notificationToken, Notifications],
  );

  const editPushNotification = useCallback(
    async (
      identifier: NotificationIdentifier,
      date: Date,
      title: string,
      message: string,
    ) => {
      await schedulePushNotification(date, title, message, false);
      await cancelPushNotification(identifier, false);
      await refreshCurrentlyScheduledNotifications();
    },
    [notificationToken, Notifications],
  );

  return {
    cancelPushNotification,
    currentlyScheduledNotifications,
    editPushNotification,
    getCurrentlyScheduledNotifications,
    historyNotifications,
    schedulePushNotification,
  };
};
