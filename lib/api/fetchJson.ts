export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export type FetchJsonOptions = Omit<RequestInit, 'body'> & {
  query?: QueryParams;
  body?: unknown;
};

const appendQueryValue = (searchParams: URLSearchParams, key: string, value: QueryValue) => {
  if (value === null || value === undefined) {
    return;
  }
  searchParams.append(key, String(value));
};

export const buildUrlWithQuery = (url: string, query?: QueryParams): string => {
  if (query === undefined) {
    return url;
  }

  const resolvedUrl = new URL(url);
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(entry => {
        appendQueryValue(resolvedUrl.searchParams, key, entry);
      });
      return;
    }
    appendQueryValue(resolvedUrl.searchParams, key, value);
  });

  return resolvedUrl.toString();
};

export const fetchJson = async <T>(url: string, options: FetchJsonOptions = {}): Promise<T> => {
  const { query, body, headers: initHeaders, ...init } = options;
  const requestUrl = buildUrlWithQuery(url, query);

  const headers = new Headers(initHeaders);
  let requestBody: BodyInit | undefined;

  if (body !== undefined) {
    requestBody = JSON.stringify(body);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const response = await fetch(requestUrl, {
    ...init,
    headers,
    body: requestBody,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    const truncatedBody = errorBody.slice(0, 200);
    throw new Error(
      `Request failed with status ${response.status}${truncatedBody ? `: ${truncatedBody}` : ''}`
    );
  }

  return (await response.json()) as T;
};
