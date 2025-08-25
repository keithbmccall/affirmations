import { useLens } from '@platform';
import { loadData, saveData, StorageDevice } from '@storage';
import { useEffect, useState } from 'react';
import { LensPalettesMap } from './types';

// TODO: fnish installing
export const useInitLensPalettes = () => {
  const [isLensPalettesInited, setIsLensPalettesInited] = useState(false);
  const { lensPalettesMap, onSetLensPalettesMap } = useLens();

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
    console.log('lensPalettes: ', isLensPalettesInited, lensPalettesMap);
    if (isLensPalettesInited && Object.keys(lensPalettesMap).length) {
      saveData(StorageDevice.LENS_PALETTES, lensPalettesMap);
    }
  }, [lensPalettesMap]);
};
