import {
  defaultTimezone,
  fiveMinutesFromNow,
  getHumanReadableDate,
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

  describe('getHumanReadableDate', () => {
    it('should format date correctly', () => {
      const testDate = new Date('2024-01-15T14:30:00Z');
      const result = getHumanReadableDate(testDate);

      expect(result).toHaveProperty('month');
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('time');
      expect(result).toHaveProperty('year');
      expect(typeof result.month).toBe('string');
      expect(typeof result.day).toBe('number');
      expect(typeof result.time).toBe('string');
      expect(typeof result.year).toBe('number');
    });

    it('should handle different dates', () => {
      const testDate = new Date('2023-12-25T09:15:00Z');
      const result = getHumanReadableDate(testDate);

      expect(result.month).toBeTruthy();
      expect(result.day).toBeTruthy();
      expect(result.time).toBeTruthy();
    });
  });
});
