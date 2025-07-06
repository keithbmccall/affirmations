import { Scheduler, ThemedText, ThemedView } from '@components';
import {
  HistoryNotification,
  NotificationIdentifier,
  NotificationWithData,
  SCHEDULE_HISTORY_PAGES,
  useNotificationsScheduler,
} from '@features/notifications';
import { useAffirmations } from '@platform';
import { useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainerProps } from './types';

interface NotificationDetailsProps extends ScreenContainerProps {
  notificationId: NotificationIdentifier;
  page: 'PENDING' | 'HISTORY';
}
// TODO: Delete + Edit logic
export const NotificationDetails = ({ notificationId, page }: NotificationDetailsProps) => {
  const { bottom } = useSafeAreaInsets();
  const {
    notifications: { pendingNotifications, historyNotifications },
  } = useAffirmations();
  const { editPushNotification, cancelPushNotification } = useNotificationsScheduler();

  const notification = useMemo(() => {
    const notifications =
      page === SCHEDULE_HISTORY_PAGES.PENDING ? pendingNotifications : historyNotifications;
    return notifications.find(notification => notification.identifier === notificationId) as
      | NotificationWithData
      | HistoryNotification;
  }, [notificationId, page]);

  const {
    content: { title, body },
  } = notification;
  const identifier = notificationId;
  const initialDate = new Date(notification.content.data.triggerDate.time);
  const initialTitle = title ?? '';
  const initialBody = body ?? '';

  const handleDelete = () => {
    cancelPushNotification(identifier);
  };

  const handleSubmit = (values: { title: string; body: string; date: Date }) => {
    editPushNotification({
      identifier,
      ...values,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView>
        <ThemedText accessibilityRole="header" testID="notification-details-title">
          {initialTitle}
        </ThemedText>
      </ThemedView>
      <Scheduler
        initialBody={initialBody}
        initialTitle={initialTitle}
        initialDate={initialDate}
        bodyLines={6}
        enableRefreshControl={false}
        submitProps={{ submitText: 'Edit Message', onSubmit: handleSubmit }}
      />
    </ThemedView>
  );
};

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
