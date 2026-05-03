import {
  capitalizeFirstLetter,
  catchError,
  keyGenerator,
  noop,
  pluralize,
  splitCamelCase,
} from '../helpers';

describe('helpers', () => {
  it('noop returns null', () => {
    expect(noop()).toBeNull();
  });

  describe('pluralize', () => {
    it('returns singular for 1', () => {
      expect(pluralize(1, 'cat')).toBe('cat');
    });
    it('returns plural for 0', () => {
      expect(pluralize(0, 'cat')).toBe('cats');
    });
    it('returns plural for >1', () => {
      expect(pluralize(2, 'cat')).toBe('cats');
    });
  });

  describe('keyGenerator', () => {
    it('returns a string', () => {
      expect(typeof keyGenerator()).toBe('string');
    });
    it('uses provided x and y', () => {
      const key = keyGenerator(1, 2);
      expect(key.startsWith('12')).toBe(true);
    });
    it('generates different keys for different calls', () => {
      expect(keyGenerator()).not.toBe(keyGenerator());
    });
  });

  describe('splitCamelCase', () => {
    it('leaves camelCase unchanged (replacement is same captured letter)', () => {
      expect(splitCamelCase('camelCaseWord')).toBe('camelCaseWord');
    });
    it('returns the same string if no uppercase', () => {
      expect(splitCamelCase('word')).toBe('word');
    });
    it('preserves multiple consecutive capitals', () => {
      expect(splitCamelCase('XMLParser')).toBe('XMLParser');
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('capitalizes the first letter of a lowercase word', () => {
      expect(capitalizeFirstLetter('hello')).toBe('Hello');
    });
    it('leaves an already capitalized string unchanged except first char', () => {
      expect(capitalizeFirstLetter('Hello')).toBe('Hello');
    });
    it('handles a single character', () => {
      expect(capitalizeFirstLetter('a')).toBe('A');
    });
    it('handles empty string', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });
  });

  describe('catchError', () => {
    it('logs the error', () => {
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
      catchError(new Error('fail'), 'log', 'action');
      expect(spy).toHaveBeenCalledWith(
        expect.stringContaining("Error during action:'action':: Log:'log':: Error:"),
        expect.any(Error)
      );
      spy.mockRestore();
    });
  });
});
