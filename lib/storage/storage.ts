import AsyncStorage from '@react-native-async-storage/async-storage';
import { catchError } from '@utils';

type SaveData = (key: string, value: string | Record<string, any>) => void;
export const saveData: SaveData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e: unknown) {
    catchError(e, `Data failed to save!!! - key: ${key} - value: ${value}`, 'saveData');
  }
};

type LoadData = (key: string) => Promise<any>;
export const loadData: LoadData = async (key: string) => {
  // AsyncStorage.clear()
  try {
    const value = await AsyncStorage.getItem(key);
    if (value) {
      return JSON.parse(value);
    }
    return false;
  } catch (e: unknown) {
    catchError(e, `Data failed to load!!! - key: ${key}`, 'loadData');
    return e;
  }
};

export const StorageDevice = {
  HISTORY_NOTIFICATIONS: 'HISTORY_NOTIFICATIONS',
  LENS_PALETTES: 'LENS_PALETTES',
} as const;
