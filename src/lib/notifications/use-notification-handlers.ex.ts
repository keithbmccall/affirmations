import { useNotificationToken } from '@platform';
import * as Notifications from 'expo-notifications';
import { Notification, Subscription } from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  notificationsFetchOptions,
  notificationsFetchUrl,
} from './notifications.config';
import { NotificationMessage } from './use-notifications';

export const useNotificationHandlersEx = () => {
  const [notification, setNotification] = useState<Notification>();
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();
  const notificationToken = useNotificationToken();

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        // we can schedule a notification
        // then in here upon receipt of the previous notification
        // we can schedule the next one and on and on
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('responsssS', response);
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
