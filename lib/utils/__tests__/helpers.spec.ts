import { describe, expect, it } from '@jest/globals';
import { getHumanReadableDate } from '../time';

describe('helpers', () => {
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
