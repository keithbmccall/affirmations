import { ExpoPushToken } from 'expo-notifications';
import {
  HistoryNotification,
  Modal,
  NotificationRequestWithData,
} from '../../types';
import { Action } from '../actions';

export interface StateType {
  app: {
    notificationToken: ExpoPushToken;
    currentlyScheduledNotifications: NotificationRequestWithData[];
    historyNotifications: HistoryNotification[];
    modal: Modal;
  };
}

export const initialState: StateType = {
  app: {
    notificationToken: {
      type: 'expo',
      data: '',
    },
    currentlyScheduledNotifications: [],
    historyNotifications: [],
    modal: {
      openModal: null,
      withData: {},
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
    case 'SET_CURRENTLY_SCHEDULED_NOTIFICATIONS':
      return {
        ...state,
        app: {
          ...state.app,
          currentlyScheduledNotifications: action.payload,
        },
      };
    case 'SET_ADD_HISTORY_NOTIFICATION':
      return {
        ...state,
        app: {
          ...state.app,
          historyNotifications: [
            ...state.app.historyNotifications,
            action.payload,
          ],
        },
      };
    case 'SET_ADD_HISTORY_NOTIFICATIONS':
      return {
        ...state,
        app: {
          ...state.app,
          historyNotifications: action.payload,
        },
      };
    case 'SET_MODAL':
      return {
        ...state,
        app: {
          ...state.app,
          modal: action.payload,
        },
      };

    default:
      return state;
  }
};
