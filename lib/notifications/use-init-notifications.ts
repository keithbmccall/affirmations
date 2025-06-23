import { Init, useNotifications } from '@platform';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { registerForPushNotificationsAsync } from './notifications.registration';

// const useInitHistory: Init = (providerActions, providerState) => {
//   const [isHistoryInited, setIsHistoryInited] = useState(false);
//   const { historyNotifications } = providerState.app;

//   useEffect(() => {
//     void loadData(StorageDevice.HISTORY_NOTIFICATIONS).then(
//       (_historyNotifications: HistoryNotification[]) => {
//         if (_historyNotifications) {
//           providerActions.onAddHistoryNotifications(_historyNotifications);
//           setIsHistoryInited(true);
//         }
//       },
//     );
//   }, [providerActions]);

//   useEffect(() => {
//     if (isHistoryInited && historyNotifications.length) {
//       saveData(StorageDevice.HISTORY_NOTIFICATIONS, historyNotifications);
//     }
//   }, [historyNotifications, isHistoryInited]);
// };
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
export const useInitNotifications: Init = (providerActions, providerState) => {
  console.log({ providerActions, providerState });
  const {
    onSetNotificationToken,
    onSetNotificationChannels,
    notifications: { token, channels },
  } = useNotifications();

  const [notification, setNotification] = useState<Notification | undefined>(undefined);
  console.log({
    token,
    channels,
    notification,
  });
  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        console.log(token);
        onSetNotificationToken(token);
      }
    });

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(channels => {
        if (channels) {
          onSetNotificationChannels(channels);
        }
      });
    }
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);
  // useInitHistory(providerActions, providerState);
};
