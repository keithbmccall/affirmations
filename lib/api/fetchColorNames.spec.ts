const mockFetchJson = jest.fn();

jest.mock('@api/fetchJson', () => ({
  fetchJson: (...args: unknown[]) => mockFetchJson(...args),
}));

import { fetchColorNames, normalizeHexValues } from '@api/fetchColorNames';
import { appHttpReferrer } from '@utils/identifiers';

describe('normalizeHexValues', () => {
  it('strips hashes, lowercases, and dedupes while preserving order', () => {
    expect(normalizeHexValues(['#AaBbCc', 'aabbcc', 'DDEEFF', '#ddeeff', '#112233'])).toEqual([
      'aabbcc',
      'ddeeff',
      '112233',
    ]);
  });

  it('skips empty values after stripping', () => {
    expect(normalizeHexValues(['#', '', '#ff0000'])).toEqual(['ff0000']);
  });
});

describe('fetchColorNames', () => {
  beforeEach(() => {
    mockFetchJson.mockReset();
  });

  it('calls fetchJson with normalized values and Color Pizza defaults', async () => {
    const response = {
      paletteTitle: 'Green Red',
      colors: [
        {
          name: 'Red',
          hex: '#ff0000',
          requestedHex: '#ff0000',
          distance: 0,
          luminance: 54.213,
          rgb: { r: 255, g: 0, b: 0 },
        },
      ],
    };
    mockFetchJson.mockResolvedValue(response);

    const result = await fetchColorNames(['#FF0000', 'ff0000', '#00FF00']);

    expect(result).toEqual(response);
    expect(mockFetchJson).toHaveBeenCalledWith('https://api.color.pizza/v1/', {
      query: {
        values: 'ff0000,00ff00',
        list: 'bestOf',
        noduplicates: true,
      },
      headers: {
        Accept: 'application/json',
        'X-Referrer': appHttpReferrer,
      },
    });
  });

  it('forwards list and noduplicates overrides', async () => {
    mockFetchJson.mockResolvedValue({ paletteTitle: 'Basic', colors: [] });

    await fetchColorNames(['#aabbcc'], { list: 'wikipedia', noduplicates: false });

    expect(mockFetchJson).toHaveBeenCalledWith('https://api.color.pizza/v1/', {
      query: {
        values: 'aabbcc',
        list: 'wikipedia',
        noduplicates: false,
      },
      headers: {
        Accept: 'application/json',
        'X-Referrer': appHttpReferrer,
      },
    });
  });
});
