import { useAffirmations } from '@platform';
import { catchError } from '@utils';
import * as Notifications from 'expo-notifications';
import { useCallback } from 'react';
import { getCurrentlyScheduledNotifications } from './get-currently-scheduled-notifications';
import { NotificationSounds } from './notification-sounds';

type SchedulePushNotification = (details: {
  title: string;
  body: string;
  date: Date;
}) => Promise<string>;

export const useNotificationsScheduler = () => {
  const {
    notifications: { token: notificationToken },
  } = useAffirmations();

  const schedulePushNotification: SchedulePushNotification = useCallback(
    async ({ date, title, body }) => {
      // if (notificationToken) {
      const time = date.getTime();
      const rawDate = date.toString();
      const stringDate = date.toDateString();

      const timeData = {
        time,
        rawDate,
        date: stringDate,
      };

      try {
        const data = {
          ...timeData,
        };
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            sound: NotificationSounds.DEFAULT,
            body,
            data,
          },
          trigger: {
            channelId: 'calendar',
            date,
          },
        });
        const currentlyScheduledNotifications = await getCurrentlyScheduledNotifications();
        console.log({
          currentlyScheduledNotifications,
        });
        return identifier;
      } catch (e: unknown) {
        const errorMessage = `Failed to schedule notification with title of: ${title} and message of: ${body}!!!`;
        catchError(e, errorMessage, 'schedulePushNotification');
        return errorMessage;
      }
      // }
    },
    [notificationToken]
  );

  // const cancelPushNotification = useCallback(
  //   async (identifier: string, calendarEventId?: string, refresh = true) => {
  //     try {
  //       await Notifications.cancelScheduledNotificationAsync(identifier);
  //       onRemoveHistoryNotification(identifier);
  //       if (calendarEventId) {
  //         deleteCalendarEvent(calendarEventId);
  //       }
  //       if (refresh) {
  //         await refreshCurrentlyScheduledNotifications();
  //       }
  //     } catch (e: unknown) {
  //       catchError(
  //         e,
  //         `Failed to cancel notification with identifier: ${identifier}!!!`,
  //         'cancelPushNotification'
  //       );
  //     }
  //   },
  //   [onRemoveHistoryNotification, deleteCalendarEvent, refreshCurrentlyScheduledNotifications]
  // );

  // const editPushNotification = useCallback(
  //   async (identifier: NotificationIdentifier, date: Date, title: string, message: string) => {
  //     await schedulePushNotification(date, title, message, { refresh: false });
  //     await cancelPushNotification(identifier, undefined, false);
  //     await refreshCurrentlyScheduledNotifications();
  //   },
  //   [schedulePushNotification, cancelPushNotification, refreshCurrentlyScheduledNotifications]
  // );

  return {
    schedulePushNotification,
  };
};
