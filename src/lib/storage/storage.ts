import AsyncStorage from '@react-native-async-storage/async-storage';

type SaveData = (
  key: string,
  value: string | Record<string, any>,
  onError?: () => void,
) => void;
export const saveData: SaveData = async (key, value, onError) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e: unknown) {
    console.log('Data failed to save!!!', { key, value });
    onError?.();
  }
};

type LoadData = (key: string) => Promise<any>;
export const loadData: LoadData = async (key: string) => {
  return AsyncStorage.getItem(key)
    .then(value => {
      if (value) {
        return JSON.parse(value);
      }
      return false;
    })
    .catch(e => {
      console.log('Data failed to load!!!');
      return e;
    });
};

export enum StorageDevice {
  HISTORY_NOTIFICATIONS = 'HISTORY_NOTIFICATIONS',
}
export const StorageDeviceConfig = {
  [StorageDevice.HISTORY_NOTIFICATIONS]: {},
};
