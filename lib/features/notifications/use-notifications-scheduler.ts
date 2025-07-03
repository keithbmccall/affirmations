import { NotificationIdentifier } from '@features/notifications';
import { useAffirmations } from '@platform';
import { catchError } from '@utils';
import { useCallback } from 'react';
import {
  cancelScheduledNotification,
  getAllScheduledNotifications,
  scheduleNotification,
} from './notifications';

export const useNotificationsScheduler = () => {
  const { onSetPendingNotifications, onAddHistoryNotification, onRemoveHistoryNotification } =
    useAffirmations();

  const refreshPendingNotifications = useCallback(async () => {
    try {
      const pendingNotifications = await getAllScheduledNotifications();
      console.log({
        pendingNotifications,
      });
      onSetPendingNotifications(pendingNotifications);
    } catch (e: unknown) {
      catchError(e, `Failed to refresh pending notifications`, 'refreshPendingNotifications');
    }
  }, [onSetPendingNotifications]);

  type SchedulePushNotification = (details: {
    title: string;
    body: string;
    date: Date;
  }) => Promise<string>;
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

        onAddHistoryNotification({
          identifier,
          content: { title, body, data, categoryIdentifier: 'affirmation' },
        });

        refreshPendingNotifications();
        return identifier;
      } catch (e: unknown) {
        const errorMessage = `Failed to schedule notification with title of: ${title} and message of: ${body}!!!`;
        catchError(e, errorMessage, 'schedulePushNotification');
        return errorMessage;
      }
    },
    [refreshPendingNotifications, onAddHistoryNotification]
  );

  const cancelPushNotification = useCallback(
    async (identifier: string) => {
      try {
        await cancelScheduledNotification(identifier);
        onRemoveHistoryNotification(identifier);
        await refreshPendingNotifications();
      } catch (e: unknown) {
        catchError(
          e,
          `Failed to cancel notification with identifier: ${identifier}!!!`,
          'cancelPushNotification'
        );
      }
    },
    [refreshPendingNotifications]
  );

  type EditPushNotification = (details: {
    identifier: NotificationIdentifier;
    title: string;
    body: string;
    date: Date;
  }) => Promise<string>;
  const editPushNotification: EditPushNotification = useCallback(
    async ({ identifier, date, title, body }) => {
      try {
        const id = await schedulePushNotification({ date, title, body });
        await cancelPushNotification(identifier);
        await refreshPendingNotifications();
        return id;
      } catch (e: unknown) {
        const errorMessage = `Failed to edit notification with identifier: ${identifier}!!!`;
        catchError(e, errorMessage, 'editPushNotification');
        return errorMessage;
      }
    },
    [schedulePushNotification, cancelPushNotification, refreshPendingNotifications]
  );

  return {
    cancelPushNotification,
    schedulePushNotification,
    refreshPendingNotifications,
    editPushNotification,
  };
};
