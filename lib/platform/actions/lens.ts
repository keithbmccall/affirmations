import { LensPalette, LensPalettesMap } from '@features/lens/lens-palette';
import { Dispatch } from 'react';
import { ActionType } from './types';

export type LensActions =
  | ActionType<'ADD_LENS_PALETTE', LensPalette>
  | ActionType<'SET_LENS_PALETTES_MAP', LensPalettesMap>;

export type LensActionsFunctions = {
  onAddLensPalette: (palette: LensPalette) => void;
  onSetLensPalettesMap: (palettes: LensPalettesMap) => void;
};

export const addLensPalette =
  (dispatch: Dispatch<LensActions>): LensActionsFunctions['onAddLensPalette'] =>
  lensPalette => {
    return dispatch({
      type: 'ADD_LENS_PALETTE',
      payload: lensPalette,
    });
  };

export const setLensPalettesMap =
  (dispatch: Dispatch<LensActions>): LensActionsFunctions['onSetLensPalettesMap'] =>
  lensPalettes => {
    return dispatch({
      type: 'SET_LENS_PALETTES_MAP',
      payload: lensPalettes,
    });
  };
