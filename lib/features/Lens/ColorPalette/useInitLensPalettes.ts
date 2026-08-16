import { useLens } from '@platform';
import { loadData, saveData, StorageDevice } from '@storage/storage';
import { useEffect, useState } from 'react';
import { normalizeLensPalettesMap } from './normalizeLensPalettesMap';

// TODO: fnish installing
export const useInitLensPalettes = () => {
  const [isLensPalettesInited, setIsLensPalettesInited] = useState(false);
  const { lensPalettesMap, onSetLensPalettesMap } = useLens();

  useEffect(() => {
    void loadData(StorageDevice.LENS_PALETTES).then(rawLensPalettes => {
      if (rawLensPalettes) {
        onSetLensPalettesMap(normalizeLensPalettesMap(rawLensPalettes));
      }
      setIsLensPalettesInited(true);
    });
  }, [onSetLensPalettesMap]);

  useEffect(() => {
    if (isLensPalettesInited && Object.keys(lensPalettesMap).length) {
      saveData(StorageDevice.LENS_PALETTES, lensPalettesMap);
    }
  }, [lensPalettesMap]);
};
