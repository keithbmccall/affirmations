import { Action } from '@platform';

export function settingsReducer(state: any, action: Action) {
  switch (action.type) {
    case 'SET_NAME':
      return {
        ...state,
        user: {
          name: action.payload,
        },
      };
    default:
      return state;
  }
}
