import { useLens } from '@platform';
import { loadData, saveData, StorageDevice } from '@storage';
import { useEffect, useState } from 'react';
import { LensPalette } from './types';

// TODO: fnish installing
export const useInitLensPalettes = () => {
  const [isLensPalettesInited, setIsLensPalettesInited] = useState(false);
  const { lensPalettes, onSetLensPalettes } = useLens();

  useEffect(() => {
    void loadData(StorageDevice.LENS_PALETTES).then((_lensPalettes: LensPalette[]) => {
      console.log('lensPalettes: ', _lensPalettes);
      if (_lensPalettes) {
        onSetLensPalettes(_lensPalettes);
      }
      setIsLensPalettesInited(true);
    });
  }, [onSetLensPalettes]);

  useEffect(() => {
    console.log('lensPalettes: ', isLensPalettesInited, lensPalettes);
    if (isLensPalettesInited && lensPalettes.length) {
      saveData(StorageDevice.LENS_PALETTES, lensPalettes);
    }
  }, [lensPalettes]);
};
