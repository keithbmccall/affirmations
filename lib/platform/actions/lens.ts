import { LensPalette } from '@features/lens/lens-palette';
import { Dispatch } from 'react';
import { ActionType } from './types';

export type LensActions = ActionType<'SET_LENS_PALETTES', LensPalette[]>;

export type LensActionsFunctions = {
  onSetLensPalettes: (palettes: LensPalette[]) => void;
};

export const setLensPalettes =
  (dispatch: Dispatch<LensActions>): LensActionsFunctions['onSetLensPalettes'] =>
  lensPalettes => {
    return dispatch({
      type: 'SET_LENS_PALETTES',
      payload: lensPalettes,
    });
  };
