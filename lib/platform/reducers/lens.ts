import { Action } from '../actions';
import { StateType } from '../state';

export function lensReducer(state: StateType['lens'], action: Action) {
  switch (action.type) {
    case 'ADD_LENS_PALETTE':
      return {
        ...state,
        lensPalettes: {
          ...state.lensPalettes,
          [action.payload.id]: action.payload,
        },
      };
    case 'SET_LENS_PALETTES_MAP':
      return {
        ...state,
        lensPalettes: action.payload,
      };
    default:
      return state;
  }
}
