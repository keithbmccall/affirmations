import { HistoryNotification } from '@features/notifications';
import { loadData, saveData, StorageDevice } from '@storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Init } from '../../platform/types';
import { getAllScheduledNotifications } from './notifications';
import { registerForPushNotificationsAsync } from './notifications.registration';

const useInitHistory: Init = (providerActions, providerState) => {
  const historyRef = useRef(false);
  const { historyNotifications } = providerState.affirmations.notifications;

  useEffect(() => {
    void loadData(StorageDevice.HISTORY_NOTIFICATIONS).then(
      (_historyNotifications: HistoryNotification[]) => {
        if (_historyNotifications) {
          providerActions.affirmations.onSetHistoryNotifications(_historyNotifications);
          historyRef.current = true;
        }
      }
    );
  }, [providerActions]);

  useEffect(() => {
    if (historyRef.current && historyNotifications.length) {
      saveData(StorageDevice.HISTORY_NOTIFICATIONS, historyNotifications);
    }
  }, [historyNotifications]);
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
export const useInitNotifications: Init = (providerActions, providerState) => {
  console.log({ providerActions, providerState });

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log(token);
        providerActions.affirmations.onSetNotificationToken(token);
      }
    });

    console.log('auth', Notifications.IosAuthorizationStatus);
    getAllScheduledNotifications().then(notifications => {
      console.log('currently Scheduled Notifications:', { notifications });
      providerActions.affirmations.onSetCurrentlyScheduledNotifications(notifications);
    });

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(channels => {
        if (channels) {
          providerActions.affirmations.onSetNotificationChannels(channels);
        }
      });
    }
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('addNotificationReceivedListener: ', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('addNotificationResponseReceivedListener: ', response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  useInitHistory(providerActions, providerState);
};
