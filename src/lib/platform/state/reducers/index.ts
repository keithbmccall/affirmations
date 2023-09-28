import { noop } from '@utils';
import { ExpoPushToken } from 'expo-notifications';
import { Dispatch } from 'react';
import { Action } from '../actions-types';

export interface StateContextActions {
  onSetNotificationToken: (token: ExpoPushToken) => void;
}

export const initialStateContextActions: StateContextActions = {
  onSetNotificationToken: noop,
};

export interface StateType {
  app: {
    notificationToken: ExpoPushToken;
  };
}

export const initialState: StateType = {
  app: {
    notificationToken: {
      type: 'expo',
      data: '',
    },
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
    default:
      return state;
  }
};

export const setNotificationToken =
  (dispatch: Dispatch<Action>): StateContextActions['onSetNotificationToken'] =>
  images => {
    return dispatch({
      type: 'SET_NOTIFICATION_TOKEN',
      payload: images,
    });
  };
