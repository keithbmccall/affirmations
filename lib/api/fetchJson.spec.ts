import { buildUrlWithQuery, fetchJson } from '@api/fetchJson';

describe('buildUrlWithQuery', () => {
  it('returns the original url when query is omitted', () => {
    expect(buildUrlWithQuery('https://example.com/v1/')).toBe('https://example.com/v1/');
  });

  it('appends scalar query params and skips nullish values', () => {
    const url = buildUrlWithQuery('https://example.com/v1/', {
      list: 'bestOf',
      noduplicates: true,
      empty: null,
      missing: undefined,
      count: 2,
    });

    expect(url).toBe('https://example.com/v1/?list=bestOf&noduplicates=true&count=2');
  });

  it('appends array query params as repeated keys', () => {
    const url = buildUrlWithQuery('https://example.com/search', {
      tag: ['red', 'blue'],
    });

    expect(url).toBe('https://example.com/search?tag=red&tag=blue');
  });
});

describe('fetchJson', () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  it('requests the url with serialized query params and returns JSON', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'Neo Mint' }),
    });

    const result = await fetchJson<{ name: string }>('https://api.example.com/v1/', {
      query: { values: 'aaffcc', list: 'bestOf' },
      headers: { Accept: 'application/json' },
    });

    expect(result).toEqual({ name: 'Neo Mint' });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [requestUrl, requestInit] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(requestUrl).toBe('https://api.example.com/v1/?values=aaffcc&list=bestOf');
    expect(requestInit.headers).toBeInstanceOf(Headers);
    expect((requestInit.headers as Headers).get('Accept')).toBe('application/json');
  });

  it('JSON-stringifies body and sets Content-Type when missing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    await fetchJson('https://api.example.com/v1/', {
      method: 'POST',
      body: { color: '#ff0000' },
    });

    const [, requestInit] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(requestInit.body).toBe(JSON.stringify({ color: '#ff0000' }));
    expect((requestInit.headers as Headers).get('Content-Type')).toBe('application/json');
  });

  it('does not overwrite an existing Content-Type header', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    await fetchJson('https://api.example.com/v1/', {
      method: 'POST',
      body: { color: '#ff0000' },
      headers: { 'Content-Type': 'application/vnd.custom+json' },
    });

    const [, requestInit] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((requestInit.headers as Headers).get('Content-Type')).toBe(
      'application/vnd.custom+json'
    );
  });

  it('throws with status and truncated body when the response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'You can request up to 100 colors at once.',
    });

    await expect(fetchJson('https://api.example.com/v1/')).rejects.toThrow(
      'Request failed with status 400: You can request up to 100 colors at once.'
    );
  });
});
