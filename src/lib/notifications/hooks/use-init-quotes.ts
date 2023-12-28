import { Init, Quotes } from '@platform';
import { catchError } from '@utils';
import { useEffect } from 'react';

const zenQuotesUrl = 'https://zenquotes.io/api/quotes/';
const fetchQuotes = async (): Promise<Quotes> => {
  return (await fetch(zenQuotesUrl)).json();
};

const validateFetchedQuotes = (quotes: Quotes) =>
  !(quotes.length === 1 && quotes[0].a === 'zenquotes.io');

export const useInitQuotes: Init = (providerActions, providerState) => {
  const {
    app: {
      quotes: { sentQuoteCount },
    },
  } = providerState;

  useEffect(() => {
    //   0 to start
    //   50 because the thing fetches 50 quotes
    //   when we get to 50 sent quotes, we need to refetch a new batch
    if (sentQuoteCount === 0 || sentQuoteCount === 50) {
      void fetchQuotes()
        .then(quotes => {
          if (validateFetchedQuotes(quotes)) {
            const validatedQuotes: Quotes = quotes.map(quote => ({
              a: quote.a,
              c: quote.c,
              q: quote.q,
            }));
            providerActions.onSetFetchQuotes(validatedQuotes);
          } else {
            catchError(
              quotes,
              `fetching quotes failed due to API validation with message - ${quotes[0].q}!!!`,
              'initQuotes',
            );
          }
        })
        .catch((e: unknown) => {
          catchError(e, 'fetching quotes failed!!!', 'initQuotes');
        });
    }
  }, [providerActions, sentQuoteCount]);
};
