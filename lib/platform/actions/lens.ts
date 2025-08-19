import { LensPalette } from '@features/lens/lens-palette';
import { Dispatch } from 'react';
import { ActionType } from './types';

export type LensActions = ActionType<'ADD_LENS_PALETTE', LensPalette>;

export type LensActionsFunctions = {
  onAddLensPalette: (palette: LensPalette) => void;
};

export const addLensPalette =
  (dispatch: Dispatch<LensActions>): LensActionsFunctions['onAddLensPalette'] =>
  lensPalette => {
    return dispatch({
      type: 'ADD_LENS_PALETTE',
      payload: lensPalette,
    });
  };
