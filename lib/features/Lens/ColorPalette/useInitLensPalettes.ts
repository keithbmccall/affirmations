import { useLens } from '@platform';
import { loadData, saveData, StorageDevice } from '@storage/storage';
import { useEffect, useState } from 'react';
// DISPOSABLE: remove this import + migrate call after all users are enriched.
import { migrateLensPaletteNamedColors } from './migrateLensPaletteNamedColors';
import { normalizeLensPalettesMap } from './normalizeLensPalettesMap';

// TODO: fnish installing
export const useInitLensPalettes = () => {
  const [isLensPalettesInited, setIsLensPalettesInited] = useState(false);
  const { lensPalettesMap, onSetLensPalettesMap, onUpdateLensPaletteNamedColors } = useLens();

  useEffect(() => {
    void loadData(StorageDevice.LENS_PALETTES).then(rawLensPalettes => {
      const normalized = rawLensPalettes ? normalizeLensPalettesMap(rawLensPalettes) : {};
      if (rawLensPalettes) {
        onSetLensPalettesMap(normalized);
      }
      setIsLensPalettesInited(true);

      // DISPOSABLE: remove after LensNamedColor backfill rollout.
      void migrateLensPaletteNamedColors({
        lensPalettesMap: normalized,
        onUpdateLensPaletteNamedColors,
      });
    });
  }, [onSetLensPalettesMap, onUpdateLensPaletteNamedColors]);

  useEffect(() => {
    if (isLensPalettesInited && Object.keys(lensPalettesMap).length) {
      saveData(StorageDevice.LENS_PALETTES, lensPalettesMap);
    }
  }, [lensPalettesMap]);
};
