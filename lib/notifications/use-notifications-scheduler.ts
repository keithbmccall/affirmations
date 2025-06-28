import { useAffirmations } from '@platform';
import { catchError } from '@utils';
import { useCallback } from 'react';
import { getAllScheduledNotifications, scheduleNotification } from './notifications';

type SchedulePushNotification = (details: {
  title: string;
  body: string;
  date: Date;
}) => Promise<string>;

export const useNotificationsScheduler = () => {
  const { onSetCurrentlyScheduledNotifications } = useAffirmations();

  const schedulePushNotification: SchedulePushNotification = useCallback(
    async ({ date, title, body }) => {
      try {
        const time = date.getTime();
        const rawDate = date.toString();
        const stringDate = date.toDateString();
        const dateNow = new Date();
        const timeNow = dateNow.getTime();
        const timeNowRaw = dateNow.toString();
        const timeNowString = dateNow.toDateString();
        const data = {
          scheduledDate: { time: timeNow, rawDate: timeNowRaw, date: timeNowString },
          triggerDate: {
            time,
            rawDate,
            date: stringDate,
          },
        };
        const identifier = await scheduleNotification({
          title,
          body,
          data,
          date,
        });
        const currentlyScheduledNotifications = await getAllScheduledNotifications();
        console.log({
          currentlyScheduledNotifications,
        });
        onSetCurrentlyScheduledNotifications(currentlyScheduledNotifications);
        return identifier;
      } catch (e: unknown) {
        const errorMessage = `Failed to schedule notification with title of: ${title} and message of: ${body}!!!`;
        catchError(e, errorMessage, 'schedulePushNotification');
        return errorMessage;
      }
    },
    []
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
