import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import type { LensPalette } from '@features/Lens/ColorPalette/types';
import type { Action } from '../actions';
import { initialState } from '../state';
import { lensReducer } from './lens';

const palette: LensPalette = {
  id: 'asset-1',
  uri: 'file:///asset-1.jpg',
  mediaType: 'photo',
  type: COLOR_LENS_MODE.LENS_POINT,
  lensPointColor: { hex: '#AABBCC' },
};

describe('lensReducer', () => {
  it('merges named colors without replacing the capture hex', () => {
    const state = {
      ...initialState.lens,
      lensPalettesMap: { [palette.id]: palette },
    };

    const result = lensReducer(
      state,
      {
        type: 'UPDATE_LENS_PALETTE_NAMED_COLORS',
        payload: {
          id: palette.id,
          colors: [
            {
              hex: '#aabbcc',
              name: 'Light Blue',
              nameDistance: 1.2,
              pantoneCode: '15-4020',
              pantoneName: 'Cerulean',
              pantoneDistance: 2.3,
            },
          ],
        },
      } as Action
    );

    expect(result.lensPalettesMap[palette.id]).toMatchObject({
      lensPointColor: {
        hex: '#AABBCC',
        name: 'Light Blue',
        nameDistance: 1.2,
        pantoneCode: '15-4020',
        pantoneName: 'Cerulean',
        pantoneDistance: 2.3,
      },
    });
  });
});
