import { ExpoPushToken } from 'expo-notifications';
import {
  CalendarEvents,
  HistoryNotification,
  Modal,
  NotificationIdentifier,
  NotificationWithData,
  Quotes,
} from '../../types';

type ActionType<Name extends string, Payload = unknown> = {
  type: Name;
  payload: Payload;
};

export type Action =
  | ActionType<'SET_NOTIFICATION_TOKEN', ExpoPushToken>
  | ActionType<'SET_CURRENTLY_SCHEDULED_NOTIFICATIONS', NotificationWithData[]>
  | ActionType<'SET_ADD_HISTORY_NOTIFICATION', HistoryNotification>
  | ActionType<'SET_ADD_HISTORY_NOTIFICATIONS', HistoryNotification[]>
  | ActionType<'SET_MODAL', Modal>
  | ActionType<'SET_REMOVE_HISTORY_NOTIFICATION', NotificationIdentifier>
  | ActionType<'SET_MAIN_CALENDAR', CalendarEvents>
  | ActionType<'SET_FETCH_QUOTES', Quotes>
  | ActionType<'SET_SENT_QUOTE_COUNT', undefined>;
