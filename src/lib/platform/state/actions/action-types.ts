import { Calendar } from 'expo-calendar';
import { ExpoPushToken } from 'expo-notifications';
import {
  HistoryNotification,
  Modal,
  NotificationIdentifier,
  NotificationWithData,
} from '../../types';
import {StateType} from "../reducers";
import {CalendarEvents} from "../../types/calendar";

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
  | ActionType<'SET_MAIN_CALENDAR', CalendarEvents>;
