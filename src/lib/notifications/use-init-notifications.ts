import {
  loadData,
  saveData,
  StateContextActions,
  StorageDevice,
  useActions,
  useAppState,
} from '@platform';
import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { notificationsRegistration } from './notifications-registration';
import { useCurrentlyScheduledNotifications } from './use-currently-scheduled-notifications';

const useInitHistory = () => {
  const { onAddHistoryNotifications } = useActions();
  const { historyNotifications } = useAppState();
  useEffect(() => {
    saveData(StorageDevice.HISTORY_NOTIFICATIONS, historyNotifications);
  }, [historyNotifications]);

  useEffect(() => {
    loadData(StorageDevice.HISTORY_NOTIFICATIONS).then(
      _historyNotifications => {
        if (historyNotifications)
          onAddHistoryNotifications(_historyNotifications);
      },
    );
  }, []);
};
export const useInitNotifications = (providerActions: StateContextActions) => {
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();
  const { getCurrentlyScheduledNotifications } =
    useCurrentlyScheduledNotifications();



  useEffect(() => {
    notificationsRegistration()
      .then(token => {
        if (token) {
          providerActions.onSetNotificationToken(token);
        }
        return getCurrentlyScheduledNotifications();
      })
      .then(notifications => {
        providerActions.onSetCurrentlyScheduledNotifications(notifications);
      });

    notificationListener.current =
      Notifications.addNotificationReceivedListener(async noti => {
        console.log('when notification is received', {
          noti,
        });
        providerActions.onSetCurrentlyScheduledNotifications(
          await getCurrentlyScheduledNotifications(),
        );
      });
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('when the notification is pressed', response);
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

  useInitHistory();
};
