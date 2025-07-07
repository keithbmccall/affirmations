import { Action } from '../actions';
import { StateType } from '../state';

export function settingsReducer(state: StateType['settings'], action: Action) {
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
