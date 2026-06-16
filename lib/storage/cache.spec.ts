import { Cache } from '@storage/cache';

type TestSnapshot = {
  value: string;
};

const EMPTY_SNAPSHOT: TestSnapshot = { value: '' };

describe('Cache', () => {
  let cache: Cache<TestSnapshot>;

  beforeEach(() => {
    cache = new Cache(EMPTY_SNAPSHOT);
  });

  it('get returns the shared empty snapshot before any set', () => {
    expect(cache.get()).toBe(EMPTY_SNAPSHOT);
    expect(cache.get()).toBe(EMPTY_SNAPSHOT);
  });

  it('get returns the stored snapshot after set', () => {
    const snapshot = { value: 'stored' };
    cache.set(snapshot);

    expect(cache.get()).toBe(snapshot);
  });

  it('set with the same reference does not notify subscribers', () => {
    const listener = jest.fn();
    const snapshot = { value: 'stored' };

    cache.set(snapshot);
    cache.subscribe(listener);
    cache.set(snapshot);

    expect(listener).not.toHaveBeenCalled();
  });

  it('set with a new reference notifies subscribers', () => {
    const listener = jest.fn();

    cache.subscribe(listener);
    cache.set({ value: 'first' });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('reset when already unset does not notify subscribers', () => {
    const listener = jest.fn();

    cache.subscribe(listener);
    cache.reset();

    expect(listener).not.toHaveBeenCalled();
  });

  it('reset after set notifies subscribers', () => {
    const listener = jest.fn();

    cache.set({ value: 'stored' });
    cache.subscribe(listener);
    cache.reset();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(cache.get()).toBe(EMPTY_SNAPSHOT);
  });
});
