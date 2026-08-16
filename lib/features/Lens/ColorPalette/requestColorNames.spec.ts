const mockFetchColorNames = jest.fn();
const mockMatchPantoneColors = jest.fn();

jest.mock('@api/fetchColorNames', () => ({
  fetchColorNames: (...args: unknown[]) => mockFetchColorNames(...args),
}));

jest.mock('@features/Lens/ColorPalette/matchPantoneColors', () => ({
  matchPantoneColors: (...args: unknown[]) => mockMatchPantoneColors(...args),
}));

import { requestColorNames } from './requestColorNames';

describe('requestColorNames', () => {
  beforeEach(() => {
    mockFetchColorNames.mockReset();
    mockMatchPantoneColors.mockReset();
    mockMatchPantoneColors.mockReturnValue({
      colors: [
        {
          requestedHex: '#aabbcc',
          name: 'cerulean',
          code: '15-4020',
          hex: '#aabcce',
          distance: 1,
        },
      ],
    });
  });

  it('merges Color Pizza and Pantone onto capture hexes', async () => {
    mockFetchColorNames.mockResolvedValue({
      paletteTitle: 'Test',
      colors: [
        {
          name: 'Ice',
          hex: '#aabbc0',
          requestedHex: '#aabbcc',
          distance: 1.2,
          luminance: 50,
          rgb: { r: 170, g: 187, b: 204 },
        },
      ],
    });

    const result = await requestColorNames(['#AABBCC']);

    expect(mockFetchColorNames).toHaveBeenCalledWith(['#AABBCC']);
    expect(mockMatchPantoneColors).toHaveBeenCalledWith(['#AABBCC']);
    expect(result).toEqual([
      {
        hex: '#AABBCC',
        name: 'Ice',
        nameDistance: 1.2,
        pantoneCode: '15-4020',
        pantoneName: 'cerulean',
        pantoneDistance: 1,
      },
    ]);
  });

  it('still returns pantone when Color Pizza fails', async () => {
    mockFetchColorNames.mockRejectedValue(new Error('network'));

    const result = await requestColorNames(['#AABBCC']);

    expect(result).toEqual([
      {
        hex: '#AABBCC',
        pantoneCode: '15-4020',
        pantoneName: 'cerulean',
        pantoneDistance: 1,
      },
    ]);
  });
});
