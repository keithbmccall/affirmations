import { Action } from '../actions';
import { StateType } from '../state';

export function lensReducer(state: StateType['lens'], action: Action) {
  //   switch (action.type) {
  //     case 'SET_NAME':
  //       return {
  //         ...state,
  //         user: {
  //           name: action.payload,
  //         },
  //       };
  //     default:
  //       return state;
  //   }
  return state;
}
