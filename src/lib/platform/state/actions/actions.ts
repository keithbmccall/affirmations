import {
  HistoryNotification,
  NotificationIdentifier,
  NotificationWithData,
} from '@platform';
import { noop } from '@utils';
import { ExpoPushToken } from 'expo-notifications';
import { Dispatch } from 'react';
import { Modal } from '../../types';
import { Action } from './action-types';

export interface StateContextActions {
  onSetNotificationToken: (token: ExpoPushToken) => void;
  onSetCurrentlyScheduledNotifications: (
    notifications: NotificationWithData[],
  ) => void;
  onAddHistoryNotification: (notification: HistoryNotification) => void;
  onRemoveHistoryNotification: (identifier: NotificationIdentifier) => void;
  onAddHistoryNotifications: (notifications: HistoryNotification[]) => void;
  onSetModal: (payload: Modal) => void;
}

export const initialStateContextActions: StateContextActions = {
  onSetNotificationToken: noop,
  onSetCurrentlyScheduledNotifications: noop,
  onAddHistoryNotification: noop,
  onRemoveHistoryNotification: noop,
  onAddHistoryNotifications: noop,
  onSetModal: noop,
};
export const setNotificationToken =
  (dispatch: Dispatch<Action>): StateContextActions['onSetNotificationToken'] =>
  token => {
    return dispatch({
      type: 'SET_NOTIFICATION_TOKEN',
      payload: token,
    });
  };

export const setCurrentlyScheduledNotifications =
  (
    dispatch: Dispatch<Action>,
  ): StateContextActions['onSetCurrentlyScheduledNotifications'] =>
  notifications => {
    return dispatch({
      type: 'SET_CURRENTLY_SCHEDULED_NOTIFICATIONS',
      payload: notifications,
    });
  };

export const setHistoryNotification =
  (
    dispatch: Dispatch<Action>,
  ): StateContextActions['onAddHistoryNotification'] =>
  notification => {
    return dispatch({
      type: 'SET_ADD_HISTORY_NOTIFICATION',
      payload: notification,
    });
  };

export const removeHistoryNotification =
  (
    dispatch: Dispatch<Action>,
  ): StateContextActions['onRemoveHistoryNotification'] =>
  identifier => {
    return dispatch({
      type: 'SET_REMOVE_HISTORY_NOTIFICATION',
      payload: identifier,
    });
  };

export const setHistoryNotifications =
  (
    dispatch: Dispatch<Action>,
  ): StateContextActions['onAddHistoryNotifications'] =>
  notifications => {
    return dispatch({
      type: 'SET_ADD_HISTORY_NOTIFICATIONS',
      payload: notifications,
    });
  };

export const setModal =
  (dispatch: Dispatch<Action>): StateContextActions['onSetModal'] =>
  payload => {
    return dispatch({
      type: 'SET_MODAL',
      payload,
    });
  };
