import { Action } from '@platform';

export function affirmationsReducer(state: any, action: Action) {
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
    case 'SET_CURRENTLY_SCHEDULED_NOTIFICATIONS':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          currentlyScheduledNotifications: action.payload,
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
    default:
      return state;
  }
}
