import type {
  LensNamedColor,
  LensPalette,
  LensPalettesMap,
} from '@features/Lens/ColorPalette/types';
import { Dispatch } from 'react';
import { ActionType } from './types';

export type LensActions =
  | ActionType<'ADD_LENS_PALETTE', LensPalette>
  | ActionType<'SET_LENS_PALETTES_MAP', LensPalettesMap>
  | ActionType<'UPDATE_LENS_PALETTE_NAMED_COLORS', { id: string; colors: LensNamedColor[] }>;

export type LensActionsFunctions = {
  onAddLensPalette: (palette: LensPalette) => void;
  onSetLensPalettesMap: (palettes: LensPalettesMap) => void;
  onUpdateLensPaletteNamedColors: (id: string, colors: LensNamedColor[]) => void;
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

export const updateLensPaletteNamedColors =
  (dispatch: Dispatch<LensActions>): LensActionsFunctions['onUpdateLensPaletteNamedColors'] =>
  (id, colors) => {
    return dispatch({
      type: 'UPDATE_LENS_PALETTE_NAMED_COLORS',
      payload: { id, colors },
    });
  };
