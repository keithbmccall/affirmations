import { Action } from '../actions';
import { StateType } from '../state';

export function affirmationsReducer(state: StateType['affirmations'], action: Action) {
  switch (action.type) {
    case 'SET_NOTIFICATION_TOKEN':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          token: action.payload,
        },
      };
    case 'SET_NOTIFICATION_CHANNELS':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          channels: action.payload,
        },
      };
    case 'SET_PENDING_NOTIFICATIONS':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          pendingNotifications: action.payload,
        },
      };
    case 'ADD_HISTORY_NOTIFICATION':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          historyNotifications: [...state.notifications.historyNotifications, action.payload],
        },
      };
    case 'SET_HISTORY_NOTIFICATIONS':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          historyNotifications: action.payload,
        },
      };
    case 'REMOVE_HISTORY_NOTIFICATION':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          historyNotifications: state.notifications.historyNotifications.filter(
            notification => notification.identifier !== action.payload
          ),
        },
      };
    default:
      return state;
  }
}
