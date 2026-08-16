import { Action } from '../actions';
import { StateType } from '../state';

const normalizeHex = (hex: string): string => hex.replace(/^#/, '').toLowerCase();

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
    case 'UPDATE_LENS_PALETTE_NAMED_COLORS': {
      const palette = state.lensPalettesMap[action.payload.id];
      if (palette === undefined) return state;

      const colorsByHex = new Map(
        action.payload.colors.map(color => [normalizeHex(color.hex), color])
      );
      const mergeColor = <T extends { hex: string }>(color: T): T => {
        const update = colorsByHex.get(normalizeHex(color.hex));
        return update === undefined ? color : { ...color, ...update, hex: color.hex };
      };

      const updatedPalette =
        palette.type === 'lens-dominant'
          ? {
              ...palette,
              palette: Object.fromEntries(
                Object.entries(palette.palette).map(([key, color]) => [key, mergeColor(color)])
              ) as typeof palette.palette,
            }
          : { ...palette, lensPointColor: mergeColor(palette.lensPointColor) };

      return {
        ...state,
        lensPalettesMap: {
          ...state.lensPalettesMap,
          [palette.id]: updatedPalette,
        },
      };
    }
    default:
      return state;
  }
}
