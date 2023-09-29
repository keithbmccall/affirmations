import * as Notifications from 'expo-notifications';
import { Notification, Subscription } from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useActions, useNotificationToken } from '../platform/state';
import { notificationsRegistration } from './notifications-registration';
import {
  notificationsFetchOptions,
  notificationsFetchUrl,
} from './notifications.config';

export type NotificationMessage = {
  title: string;
  body: string;
};
export const useNotifications = () => {
  const notificationToken = useNotificationToken();
  const { onSetNotificationToken } = useActions();
  const [notification, setNotification] = useState<Notification>();
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  // Can use this function below or use Expo's Push Notification Tool from: https://expo.dev/notifications
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

  useEffect(() => {
    notificationsRegistration().then(token => {
      if (token) {
        onSetNotificationToken(token);
      }
    });

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

  return {
    notification,
    notificationToken,
    sendPushNotification,
  };
};
