import {
  defaultTimezone,
  fiveMinutesFromNow,
  january2030,
  rightNow,
  twoYearsFromNow,
} from '../time';

describe('time utils', () => {
  it('should have the correct default timezone', () => {
    expect(defaultTimezone).toBe('America/Los_Angeles');
  });

  it('fiveMinutesFromNow should be about 5 minutes in the future', () => {
    const now = new Date();
    const diff = fiveMinutesFromNow.getTime() - now.getTime();
    expect(diff).toBeGreaterThanOrEqual(4.5 * 60 * 1000); // at least 4.5 minutes
    expect(diff).toBeLessThanOrEqual(5.5 * 60 * 1000); // at most 5.5 minutes
  });

  it('january2030 should be January 1, 2030', () => {
    expect(january2030.getFullYear()).toBe(2030);
    expect(january2030.getMonth()).toBe(0);
    expect(january2030.getDate()).toBe(1);
  });

  it('rightNow should be close to now', () => {
    const now = new Date();
    expect(Math.abs(rightNow.getTime() - now.getTime())).toBeLessThan(1000); // within 1 second
  });

  it('twoYearsFromNow should be about 2 years in the future', () => {
    const now = new Date();
    const diff = twoYearsFromNow.getTime() - now.getTime();
    const twoYearsMs = 2 * 365 * 24 * 60 * 60 * 1000;
    expect(diff).toBeGreaterThan(twoYearsMs - 1000 * 60 * 60 * 24 * 2); // allow 2 days margin
    expect(diff).toBeLessThan(twoYearsMs + 1000 * 60 * 60 * 24 * 2);
  });
});
