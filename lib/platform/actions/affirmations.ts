import { NotificationChannel } from 'expo-notifications';
import { Dispatch } from 'react';
import { NotificationWithData } from '../../notifications/types';
import { ActionType } from './types';

export type AffirmationsActions =
  | ActionType<'SET_NOTIFICATION_TOKEN', string>
  | ActionType<'SET_NOTIFICATION_CHANNELS', NotificationChannel[]>
  | ActionType<'SET_CURRENTLY_SCHEDULED_NOTIFICATIONS', NotificationWithData[]>;

export type AffirmationsActionsFunctions = {
  onSetNotificationToken: (token: string) => void;
  onSetNotificationChannels: (channels: NotificationChannel[]) => void;
  onSetCurrentlyScheduledNotifications: (notifications: NotificationWithData[]) => void;
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

export const setCurrentlyScheduledNotifications =
  (
    dispatch: Dispatch<AffirmationsActions>
  ): AffirmationsActionsFunctions['onSetCurrentlyScheduledNotifications'] =>
  notifications => {
    return dispatch({
      type: 'SET_CURRENTLY_SCHEDULED_NOTIFICATIONS',
      payload: notifications,
    });
  };
