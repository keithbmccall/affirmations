export const noop = () => null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pluralize = (itemLength: number, word: string) => {
  return itemLength === 1 ? word : `${word}s`;
};

export const keyGenerator = (
  x: number | string = Math.random(),
  y: number | string = Math.random(),
) => `${x}${y}${Math.ceil(Math.random() * 1000)}`;

export const splitCamelCase = (string: string) =>
  string.replace(/([A-Z])/g, '$1');

export const catchError = (e: unknown, log: string, action: string) => {
  console.log(`Error during action:'${action}':: Log:'${log}':: Error:`, e);
};
