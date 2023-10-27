import { ExpoPushToken } from 'expo-notifications';
import {
  HistoryNotification,
  Modal,
  NotificationRequestWithData,
} from '../../types';

type ActionType<Name extends string, Payload = unknown> = {
  type: Name;
  payload: Payload;
};

export type Action =
  | ActionType<'SET_NOTIFICATION_TOKEN', ExpoPushToken>
  | ActionType<
      'SET_CURRENTLY_SCHEDULED_NOTIFICATIONS',
      NotificationRequestWithData[]
    >
  | ActionType<'SET_ADD_HISTORY_NOTIFICATION', HistoryNotification>
  | ActionType<'SET_ADD_HISTORY_NOTIFICATIONS', HistoryNotification[]>
  | ActionType<'SET_MODAL', Modal>;
