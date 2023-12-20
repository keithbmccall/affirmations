import { useActions, useNotificationToken } from '@platform';
import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-notifications';
import { useCallback, useEffect, useRef } from 'react';
import { getCurrentlyScheduledNotifications } from '../get-currently-scheduled-notifications';
import {
  notificationsFetchOptions,
  notificationsFetchUrl,
} from '../notifications.config';
import { NotificationMessage } from './use-notifications';

export const useNotificationHandlersEx = () => {
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();
  const notificationToken = useNotificationToken();
  const { onSetCurrentlyScheduledNotifications } = useActions();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(async noti => {
        console.log('notification received', {
          noti,
        });
        onSetCurrentlyScheduledNotifications(
          await getCurrentlyScheduledNotifications(),
        );
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('notification responsssS', response);
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current,
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const sendPushNotification = useCallback(
    async (message: NotificationMessage) => {
      await fetch(notificationsFetchUrl, {
        ...notificationsFetchOptions,
        body: JSON.stringify({
          to: notificationToken.data,
          sound: 'default',
          title: message.title,
          body: message.body,
          data: { someData: 'goes here' },
        }),
      });
    },
    [notificationToken],
  );
};
