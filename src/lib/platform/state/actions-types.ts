import { NotificationRequestWithData } from '@platform';
import { ExpoPushToken } from 'expo-notifications';

type ActionType<Name extends string, Payload = unknown> = {
  type: Name;
  payload: Payload;
};

export type Action =
  | ActionType<'SET_NOTIFICATION_TOKEN', ExpoPushToken>
  | ActionType<
      'SET_CURRENTLY_SCHEDULED_NOTIFICATIONS',
      NotificationRequestWithData[]
    >;