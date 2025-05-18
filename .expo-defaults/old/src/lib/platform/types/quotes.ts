export type Quote = {
  a: string;
  c: string;
  q: string;
};
export type Quotes = Quote[];

export type QuotesObject = {
  list: Quotes;
  sentQuoteCount: number;
};
