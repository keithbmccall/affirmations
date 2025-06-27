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
    default:
      return state;
  }
}
