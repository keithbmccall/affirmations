import AsyncStorage from '@react-native-async-storage/async-storage';
import * as helpers from '@utils/helpers';
import { loadData, saveData } from '@storage/storage';

describe('storage', () => {
  beforeEach(() => {
    jest.spyOn(helpers, 'catchError').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('persists stringified values', async () => {
    await saveData('k1', { a: 1 });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('k1', JSON.stringify({ a: 1 }));
  });

  it('reports save failures through catchError', async () => {
    jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('write fail'));
    await saveData('k2', 'v');
    expect(helpers.catchError).toHaveBeenCalled();
  });

  it('parses stored JSON and returns false when empty', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockResolvedValueOnce(null);
    await expect(loadData('empty')).resolves.toBe(false);
  });

  it('returns parsed objects when present', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockResolvedValueOnce(JSON.stringify({ ok: true }));
    await expect(loadData('obj')).resolves.toEqual({ ok: true });
  });

  it('returns the error when load throws', async () => {
    const err = new Error('read fail');
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(err);
    await expect(loadData('bad')).resolves.toBe(err);
    expect(helpers.catchError).toHaveBeenCalled();
  });
});
