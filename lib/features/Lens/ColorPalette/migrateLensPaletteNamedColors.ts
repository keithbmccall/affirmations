import { getLensPaletteCaptureHexes } from '@features/Lens/ColorPalette/buildLensNamedColors';
import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { requestColorNames } from '@features/Lens/ColorPalette/requestColorNames';
import type {
  LensNamedColor,
  LensPalette,
  LensPalettesMap,
} from '@features/Lens/ColorPalette/types';
import { loadData, saveData, StorageDevice } from '@storage/storage';

/**
 * DISPOSABLE: delete this module (+ wire in useInitLensPalettes + storage flag)
 * after all users have been migrated to LensNamedColor enrichment.
 */

export const DEFAULT_PIZZA_REQUEST_DELAY_MS = 750;

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

export const lensNamedColorNeedsEnrichment = (color: LensNamedColor): boolean => {
  return color.name === undefined || color.pantoneCode === undefined;
};

const lensPaletteNeedsEnrichment = (palette: LensPalette): boolean => {
  if (palette.type === COLOR_LENS_MODE.LENS_POINT) {
    return lensNamedColorNeedsEnrichment(palette.lensPointColor);
  }

  return Object.values(palette.palette).some(lensNamedColorNeedsEnrichment);
};

type MigrateLensPaletteNamedColorsArgs = {
  lensPalettesMap: LensPalettesMap;
  onUpdateLensPaletteNamedColors: (id: string, colors: LensNamedColor[]) => void;
  delayMsBetweenPizzaRequests?: number;
};

export const migrateLensPaletteNamedColors = async ({
  lensPalettesMap,
  onUpdateLensPaletteNamedColors,
  delayMsBetweenPizzaRequests = DEFAULT_PIZZA_REQUEST_DELAY_MS,
}: MigrateLensPaletteNamedColorsArgs): Promise<{ migratedPaletteCount: number }> => {
  const alreadyMigrated = await loadData(StorageDevice.LENS_PALETTES_NAMED_MIGRATED);
  if (alreadyMigrated === true) {
    return { migratedPaletteCount: 0 };
  }

  const palettesNeedingWork = Object.values(lensPalettesMap).filter(lensPaletteNeedsEnrichment);
  if (palettesNeedingWork.length === 0) {
    await saveData(StorageDevice.LENS_PALETTES_NAMED_MIGRATED, true);
    return { migratedPaletteCount: 0 };
  }

  let migratedPaletteCount = 0;
  let allFullyEnriched = true;

  for (let i = 0; i < palettesNeedingWork.length; i += 1) {
    const palette = palettesNeedingWork[i];
    const namedColors = await requestColorNames(getLensPaletteCaptureHexes(palette));
    if (namedColors.some(lensNamedColorNeedsEnrichment)) {
      allFullyEnriched = false;
    }

    onUpdateLensPaletteNamedColors(palette.id, namedColors);
    migratedPaletteCount += 1;

    // Throttle Color Pizza: delay after every palette request (including the last).
    await sleep(delayMsBetweenPizzaRequests);
  }

  if (allFullyEnriched) {
    await saveData(StorageDevice.LENS_PALETTES_NAMED_MIGRATED, true);
  }

  return { migratedPaletteCount };
};
