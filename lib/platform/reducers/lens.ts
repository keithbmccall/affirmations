import { Action } from '../actions';
import { StateType } from '../state';

export function lensReducer(state: StateType['lens'], action: Action) {
  switch (action.type) {
    case 'SET_LENS_PALETTES':
      return {
        ...state,
        lensPalettes: [...state.lensPalettes, action.payload],
      };
    default:
      return state;
  }
}
