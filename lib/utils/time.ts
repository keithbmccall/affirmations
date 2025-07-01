export const defaultTimezone = 'America/Los_Angeles';
export const fiveMinutesFromNow = new Date(new Date().getTime() + 5 * 60000);

export const january2030 = new Date(2030, 0, 1);

export const rightNow = new Date();

export const twoYearsFromNow = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000);

export const getHumanReadableDate = (date: Date) => {
  const month = date.toLocaleString('default', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  const time = date.toLocaleString('default', { hour: '2-digit', minute: '2-digit' });
  return {
    month,
    day,
    time,
    year,
  };
};
