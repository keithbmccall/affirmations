import { NotificationDetails } from '@features/Affirmations/NotificationDetails';
import type { NotificationDetailsParams } from '@features/Affirmations/Notifications/types';
import { useLocalSearchParams } from 'expo-router';

export default function NotificationDetailsModal() {
  const { notificationId, page } = useLocalSearchParams<NotificationDetailsParams>();

  return <NotificationDetails notificationId={notificationId} page={page} />;
}
