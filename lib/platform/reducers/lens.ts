import { Action } from '../actions';
import { StateType } from '../state';

export function lensReducer(state: StateType['lens'], action: Action) {
  switch (action.type) {
    case 'ADD_LENS_PALETTE':
      return {
        ...state,
        lensPalettesMap: {
          ...state.lensPalettesMap,
          [action.payload.id]: action.payload,
        },
      };
    case 'SET_LENS_PALETTES_MAP':
      return {
        ...state,
        lensPalettesMap: action.payload,
      };
    default:
      return state;
  }
}
