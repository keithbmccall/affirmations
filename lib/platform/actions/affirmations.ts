import { HistoryNotification, NotificationWithData } from '@features/notifications';
import { NotificationChannel } from 'expo-notifications';
import { Dispatch } from 'react';
import { ActionType } from './types';

export type AffirmationsActions =
  | ActionType<'SET_NOTIFICATION_TOKEN', string>
  | ActionType<'SET_NOTIFICATION_CHANNELS', NotificationChannel[]>
  | ActionType<'SET_PENDING_NOTIFICATIONS', NotificationWithData[]>
  //
  | ActionType<'ADD_HISTORY_NOTIFICATION', HistoryNotification>
  | ActionType<'SET_HISTORY_NOTIFICATIONS', HistoryNotification[]>;

export type AffirmationsActionsFunctions = {
  onSetNotificationToken: (token: string) => void;
  onSetNotificationChannels: (channels: NotificationChannel[]) => void;
  onSetPendingNotifications: (notifications: NotificationWithData[]) => void;
  //
  onAddHistoryNotification: (notification: HistoryNotification) => void;
  onSetHistoryNotifications: (notifications: HistoryNotification[]) => void;
};

export const setNotificationToken =
  (
    dispatch: Dispatch<AffirmationsActions>
  ): AffirmationsActionsFunctions['onSetNotificationToken'] =>
  token => {
    return dispatch({
      type: 'SET_NOTIFICATION_TOKEN',
      payload: token,
    });
  };

export const setNotificationChannels =
  (
    dispatch: Dispatch<AffirmationsActions>
  ): AffirmationsActionsFunctions['onSetNotificationChannels'] =>
  channels => {
    return dispatch({
      type: 'SET_NOTIFICATION_CHANNELS',
      payload: channels,
    });
  };

export const setPendingNotifications =
  (
    dispatch: Dispatch<AffirmationsActions>
  ): AffirmationsActionsFunctions['onSetPendingNotifications'] =>
  notifications => {
    return dispatch({
      type: 'SET_PENDING_NOTIFICATIONS',
      payload: notifications,
    });
  };

export const addHistoryNotification =
  (
    dispatch: Dispatch<AffirmationsActions>
  ): AffirmationsActionsFunctions['onAddHistoryNotification'] =>
  notification => {
    return dispatch({
      type: 'ADD_HISTORY_NOTIFICATION',
      payload: notification,
    });
  };

export const setHistoryNotifications =
  (
    dispatch: Dispatch<AffirmationsActions>
  ): AffirmationsActionsFunctions['onSetHistoryNotifications'] =>
  notifications => {
    return dispatch({
      type: 'SET_HISTORY_NOTIFICATIONS',
      payload: notifications,
    });
  };
