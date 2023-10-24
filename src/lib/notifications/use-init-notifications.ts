import { StateContextActions, StateType } from '@platform';
import { StorageDevice, loadData, saveData } from '@storage';
import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-notifications';
import { useEffect, useRef, useState } from 'react';
import { notificationsRegistration } from './notifications-registration';
import { useCurrentlyScheduledNotifications } from './use-currently-scheduled-notifications';

const useInitHistory = (
  providerActions: StateContextActions,
  providerState: StateType,
) => {
  const [isHistoryInited, setIsHistoryInited] = useState(false);
  const { historyNotifications } = providerState.app;

  useEffect(() => {
    loadData(StorageDevice.HISTORY_NOTIFICATIONS).then(
      _historyNotifications => {
        if (_historyNotifications) {
          providerActions.onAddHistoryNotifications(_historyNotifications);
          setIsHistoryInited(true);
        }
      },
    );
  }, []);

  useEffect(() => {
    if (isHistoryInited && historyNotifications.length) {
      saveData(StorageDevice.HISTORY_NOTIFICATIONS, historyNotifications);
    }
  }, [historyNotifications, isHistoryInited]);
};

export const useInitNotifications = (
  providerActions: StateContextActions,
  providerState: StateType,
) => {
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

  useInitHistory(providerActions, providerState);
};
