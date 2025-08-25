import { useLens } from '@platform';
import { loadData, saveData, StorageDevice } from '@storage';
import { useEffect, useState } from 'react';
import { LensPalettesMap } from './types';

// TODO: fnish installing
export const useInitLensPalettes = () => {
  const [isLensPalettesInited, setIsLensPalettesInited] = useState(false);
  const { lensPalettes, onSetLensPalettesMap } = useLens();

  useEffect(() => {
    void loadData(StorageDevice.LENS_PALETTES).then((_lensPalettes: LensPalettesMap) => {
      console.log('lensPalettes: ', _lensPalettes);
      if (_lensPalettes) {
        onSetLensPalettesMap(_lensPalettes);
      }
      setIsLensPalettesInited(true);
    });
  }, [onSetLensPalettesMap]);

  useEffect(() => {
    console.log('lensPalettes: ', isLensPalettesInited, lensPalettes);
    if (isLensPalettesInited && Object.keys(lensPalettes).length) {
      saveData(StorageDevice.LENS_PALETTES, lensPalettes);
    }
  }, [lensPalettes]);
};
