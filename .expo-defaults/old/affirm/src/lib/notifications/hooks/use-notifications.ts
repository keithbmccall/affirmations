import { useCalendarEvents } from '@calendar-events';
import {
  NotificationContentData,
  NotificationIdentifier,
  useActions,
  useAppState,
  useNotificationToken,
} from '@platform';
import { catchError } from '@utils';
import * as Notifications from 'expo-notifications';
import { useCallback } from 'react';
import { getCurrentlyScheduledNotifications } from '../get-currently-scheduled-notifications';
import { NotificationSounds } from '../notification-sounds';

export type NotificationMessage = {
  title: string;
  body: string;
};

export const useNotifications = () => {
  const notificationToken = useNotificationToken();
  const { currentlyScheduledNotifications, historyNotifications } =
    useAppState();
  const { createCalendarEvent, deleteCalendarEvent } = useCalendarEvents();
  const {
    onAddHistoryNotification,
    onRemoveHistoryNotification,
    onSetCurrentlyScheduledNotifications,
  } = useActions();

  const refreshCurrentlyScheduledNotifications = useCallback(
    async () =>
      onSetCurrentlyScheduledNotifications(
        await getCurrentlyScheduledNotifications(),
      ),
    [onSetCurrentlyScheduledNotifications],
  );

  const schedulePushNotification = useCallback(
    async (
      date: Date,
      title: string,
      message: string,
      { refresh = true, isQuote = false } = {},
    ) => {
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
          const calendarEventId = await createCalendarEvent({
            title,
            startDate: date,
            notes: body,
          });
          const data: NotificationContentData = {
            ...timeData,
            calendarEventId: calendarEventId ? calendarEventId : undefined,
            isQuote: isQuote ?? false,
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

          onAddHistoryNotification({
            identifier,
            content: {
              title,
              body:message,
              data,
            },
          });

          if (refresh) {
            await refreshCurrentlyScheduledNotifications();
          }
        } catch (e: unknown) {
          catchError(
            e,
            `Failed to schedule notification with title of: ${title} and message of: ${message}!!!`,
            'schedulePushNotification',
          );
        }
      }
    },
    [
      createCalendarEvent,
      notificationToken,
      onAddHistoryNotification,
      refreshCurrentlyScheduledNotifications,
    ],
  );

  const cancelPushNotification = useCallback(
    async (identifier: string, calendarEventId?: string, refresh = true) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
        onRemoveHistoryNotification(identifier);
        if (calendarEventId) {
          deleteCalendarEvent(calendarEventId);
        }
        if (refresh) {
          await refreshCurrentlyScheduledNotifications();
        }
      } catch (e: unknown) {
        catchError(
          e,
          `Failed to cancel notification with identifier: ${identifier}!!!`,
          'cancelPushNotification',
        );
      }
    },
    [
      onRemoveHistoryNotification,
      deleteCalendarEvent,
      refreshCurrentlyScheduledNotifications,
    ],
  );

  const editPushNotification = useCallback(
    async (
      identifier: NotificationIdentifier,
      date: Date,
      title: string,
      message: string,
    ) => {
      await schedulePushNotification(date, title, message, { refresh: false });
      await cancelPushNotification(identifier, undefined, false);
      await refreshCurrentlyScheduledNotifications();
    },
    [
      schedulePushNotification,
      cancelPushNotification,
      refreshCurrentlyScheduledNotifications,
    ],
  );

  return {
    cancelPushNotification,
    currentlyScheduledNotifications,
    editPushNotification,
    historyNotifications,
    schedulePushNotification,
  };
};
