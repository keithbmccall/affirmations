import { NotificationDetails } from '@features/affirmations/notification-details';
import type { NotificationDetailsParams } from '@features/affirmations/notifications/types';
import { useLocalSearchParams } from 'expo-router';

export default function NotificationDetailsModal() {
  const { notificationId, page } = useLocalSearchParams<NotificationDetailsParams>();

  return <NotificationDetails notificationId={notificationId} page={page} />;
}
