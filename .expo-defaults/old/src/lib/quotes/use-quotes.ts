import { useActions, useAppState } from '@platform';
import { useCallback } from 'react';

export const useQuotes = () => {
  const {
    quotes: { list: quotesList, sentQuoteCount },
  } = useAppState();
  const { onSetSentQuoteCount } = useActions();

  const tellQuote = useCallback(() => {
    const quote = quotesList[sentQuoteCount];
    onSetSentQuoteCount();
    return quote;
  }, [onSetSentQuoteCount, quotesList, sentQuoteCount]);

  return {
    quotesList,
    sentQuoteCount,
    tellQuote,
  };
};
