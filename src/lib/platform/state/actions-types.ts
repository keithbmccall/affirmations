import { ExpoPushToken } from 'expo-notifications';

type ActionType<Name extends string, Payload = unknown> = {
  type: Name;
  payload: Payload;
};

export type Action = ActionType<'SET_NOTIFICATION_TOKEN', ExpoPushToken>;
