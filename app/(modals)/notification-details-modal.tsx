import { NotificationDetailsParams } from '@features/notifications';
import { NotificationDetails } from '@screen-containers/notification-details';
import { useLocalSearchParams } from 'expo-router';

export default function NotificationDetailsModal() {
  const { notificationId, page } = useLocalSearchParams<NotificationDetailsParams>();

  return <NotificationDetails notificationId={notificationId} page={page} />;
}
