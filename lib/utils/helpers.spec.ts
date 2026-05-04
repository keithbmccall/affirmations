import { capitalizeFirstLetter, noop, pluralize } from './helpers';

describe('helpers', () => {
  it('noop returns null', () => {
    expect(noop()).toBeNull();
  });

  it('pluralize uses singular when length is 1', () => {
    expect(pluralize(1, 'cat')).toBe('cat');
  });

  it('pluralize uses plural when length is not 1', () => {
    expect(pluralize(2, 'cat')).toBe('cats');
  });

  it('capitalizeFirstLetter uppercases first character', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
  });
});
