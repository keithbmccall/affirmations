import { Dispatch } from 'react';
import { ActionType } from './types';

export type GeneralActions = ActionType<'SET_LOADING', boolean>;

export type GeneralActionsFunctions = {
  onSetLoading: (isLoading: boolean) => void;
};

export const setLoading =
  (dispatch: Dispatch<GeneralActions>): GeneralActionsFunctions['onSetLoading'] =>
  isLoading => {
    return dispatch({
      type: 'SET_LOADING',
      payload: isLoading,
    });
  };
