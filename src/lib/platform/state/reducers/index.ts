import { NotificationRequestWithData } from '@platform';
import { noop } from '@utils';
import { ExpoPushToken } from 'expo-notifications';
import { Dispatch } from 'react';
import { Action } from '../actions-types';

export interface StateContextActions {
  onSetNotificationToken: (token: ExpoPushToken) => void;
  onSetCurrentlyScheduledNotifications: (
    notifications: NotificationRequestWithData[],
  ) => void;
}

export const initialStateContextActions: StateContextActions = {
  onSetNotificationToken: noop,
  onSetCurrentlyScheduledNotifications: noop,
};

export interface StateType {
  app: {
    notificationToken: ExpoPushToken;
    currentlyScheduledNotifications: NotificationRequestWithData[];
  };
}

export const initialState: StateType = {
  app: {
    notificationToken: {
      type: 'expo',
      data: '',
    },
    currentlyScheduledNotifications: [],
  },
};

export const stateReducer = (
  state = initialState,
  action: Action,
): StateType => {
  console.log({
    action,
  });
  switch (action.type) {
    case 'SET_NOTIFICATION_TOKEN':
      return {
        ...state,
        app: {
          ...state.app,
          notificationToken: action.payload,
        },
      };
    case 'SET_CURRENTLY_SCHEDULED_NOTIFICATIONS':
      return {
        ...state,
        app: {
          ...state.app,
          currentlyScheduledNotifications: action.payload,
        },
      };
    default:
      return state;
  }
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
