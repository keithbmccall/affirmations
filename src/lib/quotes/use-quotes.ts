import { useActions, useAppState } from '@platform';

export const useQuotes = () => {
  const {
    quotes: { list: quotesList, sentQuoteCount },
  } = useAppState();
  const { onSetSentQuoteCount } = useActions();
  const tellQuote = () => {
    const quote = quotesList[sentQuoteCount];
    onSetSentQuoteCount();
    return quote;
  };

  return {
    quotesList,
    sentQuoteCount,
    tellQuote,
  };
};
