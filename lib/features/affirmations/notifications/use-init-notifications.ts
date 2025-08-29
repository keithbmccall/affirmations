import { HistoryNotification } from '@features/affirmations/notifications';
import { Init } from '@platform';
import { loadData, saveData, StorageDevice } from '@storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { getAllScheduledNotifications } from './notifications';
import { registerForPushNotificationsAsync } from './notifications.registration';

// TODO: move to platform or move to screen-containers/affirmations.tsx
const useInitHistoryNotifications: Init = (providerActions, providerState) => {
  const [isHistoryInited, setIsHistoryInited] = useState(false);
  const { historyNotifications } = providerState.affirmations.notifications;

  useEffect(() => {
    void loadData(StorageDevice.HISTORY_NOTIFICATIONS).then(
      (_historyNotifications: HistoryNotification[]) => {
        if (_historyNotifications) {
          providerActions.affirmations.onSetHistoryNotifications(_historyNotifications);
        }
        setIsHistoryInited(true);
      }
    );
  }, [providerActions]);

  useEffect(() => {
    if (isHistoryInited && historyNotifications.length) {
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
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log(token);
        providerActions.affirmations.onSetNotificationToken(token);
      }
    });

    getAllScheduledNotifications().then(notifications => {
      providerActions.affirmations.onSetPendingNotifications(notifications);
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

  useInitHistoryNotifications(providerActions, providerState);
};
