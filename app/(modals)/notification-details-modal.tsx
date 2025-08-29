import { NotificationDetails } from '@features/affirmations';
import { NotificationDetailsParams } from '@features/affirmations/notifications';
import { useLocalSearchParams } from 'expo-router';

export default function NotificationDetailsModal() {
  const { notificationId, page } = useLocalSearchParams<NotificationDetailsParams>();

  return <NotificationDetails notificationId={notificationId} page={page} />;
}
