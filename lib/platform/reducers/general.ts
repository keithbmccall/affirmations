import { Action } from '../actions';
import { StateType } from '../state';

export function generalReducer(state: StateType['general'], action: Action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}
