import { Dispatch } from 'react';
import { ActionType } from './types';

export type SettingsActions = ActionType<'SET_NAME', string>;

export type SettingsActionsFunctions = {
  onSetName: (name: string) => void;
};
export const setName =
  (dispatch: Dispatch<SettingsActions>): SettingsActionsFunctions['onSetName'] =>
  name => {
    return dispatch({
      type: 'SET_NAME',
      payload: name,
    });
  };
