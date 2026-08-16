const mockFetchColorNames = jest.fn();
const mockMatchPantoneColors = jest.fn();
const mockLoadData = jest.fn();
const mockSaveData = jest.fn();

jest.mock('@api/fetchColorNames', () => ({
  fetchColorNames: (...args: unknown[]) => mockFetchColorNames(...args),
}));

jest.mock('@features/Lens/ColorPalette/matchPantoneColors', () => ({
  matchPantoneColors: (...args: unknown[]) => mockMatchPantoneColors(...args),
}));

jest.mock('@storage/storage', () => ({
  StorageDevice: {
    LENS_PALETTES_NAMED_MIGRATED: 'LENS_PALETTES_NAMED_MIGRATED',
  },
  loadData: (...args: unknown[]) => mockLoadData(...args),
  saveData: (...args: unknown[]) => mockSaveData(...args),
}));

import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import type { LensPalettesMap } from '@features/Lens/ColorPalette/types';
import { StorageDevice } from '@storage/storage';
import {
  lensNamedColorNeedsEnrichment,
  migrateLensPaletteNamedColors,
} from './migrateLensPaletteNamedColors';

describe('lensNamedColorNeedsEnrichment', () => {
  it('is true when name or pantoneCode is missing', () => {
    expect(lensNamedColorNeedsEnrichment({ hex: '#fff' })).toBe(true);
    expect(lensNamedColorNeedsEnrichment({ hex: '#fff', name: 'White' })).toBe(true);
    expect(lensNamedColorNeedsEnrichment({ hex: '#fff', pantoneCode: '11-0601' })).toBe(true);
    expect(
      lensNamedColorNeedsEnrichment({
        hex: '#fff',
        name: 'White',
        pantoneCode: '11-0601',
      })
    ).toBe(false);
  });
});

describe('migrateLensPaletteNamedColors', () => {
  const onUpdate = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    mockFetchColorNames.mockReset();
    mockMatchPantoneColors.mockReset();
    mockLoadData.mockReset();
    mockSaveData.mockReset();
    onUpdate.mockReset();
    mockLoadData.mockResolvedValue(false);
    mockSaveData.mockResolvedValue(undefined);
    mockMatchPantoneColors.mockReturnValue({
      colors: [
        {
          requestedHex: '#aabbcc',
          name: 'cerulean',
          code: '15-4020',
          hex: '#aabcce',
          distance: 1,
        },
      ],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('skips when the migrated flag is already set', async () => {
    mockLoadData.mockResolvedValue(true);

    const result = await migrateLensPaletteNamedColors({
      lensPalettesMap: {},
      onUpdateLensPaletteNamedColors: onUpdate,
    });

    expect(result).toEqual({ migratedPaletteCount: 0 });
    expect(mockFetchColorNames).not.toHaveBeenCalled();
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('marks migrated and skips pizza when nothing needs enrichment', async () => {
    const lensPalettesMap: LensPalettesMap = {
      'asset-1': {
        id: 'asset-1',
        uri: 'file:///a.jpg',
        mediaType: 'photo',
        type: COLOR_LENS_MODE.LENS_POINT,
        lensPointColor: {
          hex: '#AABBCC',
          name: 'Ice',
          pantoneCode: '15-4020',
        },
      },
    };

    const result = await migrateLensPaletteNamedColors({
      lensPalettesMap,
      onUpdateLensPaletteNamedColors: onUpdate,
    });

    expect(result).toEqual({ migratedPaletteCount: 0 });
    expect(mockFetchColorNames).not.toHaveBeenCalled();
    expect(mockSaveData).toHaveBeenCalledWith(StorageDevice.LENS_PALETTES_NAMED_MIGRATED, true);
  });

  it('enriches sequentially with delay and preserves capture hex', async () => {
    mockFetchColorNames.mockResolvedValue({
      paletteTitle: 'Test',
      colors: [
        {
          name: 'Ice',
          hex: '#aabbc0',
          requestedHex: '#aabbcc',
          distance: 1.2,
          luminance: 50,
          rgb: { r: 170, g: 187, b: 204 },
        },
      ],
    });

    const lensPalettesMap: LensPalettesMap = {
      'asset-1': {
        id: 'asset-1',
        uri: 'file:///a.jpg',
        mediaType: 'photo',
        type: COLOR_LENS_MODE.LENS_POINT,
        lensPointColor: { hex: '#AABBCC' },
      },
      'asset-2': {
        id: 'asset-2',
        uri: 'file:///b.jpg',
        mediaType: 'photo',
        type: COLOR_LENS_MODE.LENS_POINT,
        lensPointColor: { hex: '#AABBCC' },
      },
    };

    const migrationPromise = migrateLensPaletteNamedColors({
      lensPalettesMap,
      onUpdateLensPaletteNamedColors: onUpdate,
      delayMsBetweenPizzaRequests: 750,
    });

    await jest.advanceTimersByTimeAsync(0);
    expect(mockFetchColorNames).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(749);
    expect(mockFetchColorNames).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1);
    expect(mockFetchColorNames).toHaveBeenCalledTimes(2);

    await jest.advanceTimersByTimeAsync(750);
    const result = await migrationPromise;

    expect(result).toEqual({ migratedPaletteCount: 2 });
    expect(onUpdate).toHaveBeenNthCalledWith(1, 'asset-1', [
      expect.objectContaining({
        hex: '#AABBCC',
        name: 'Ice',
        pantoneCode: '15-4020',
        pantoneName: 'cerulean',
      }),
    ]);
    expect(mockSaveData).toHaveBeenCalledWith(StorageDevice.LENS_PALETTES_NAMED_MIGRATED, true);
  });

  it('still applies pantone when color pizza fails and does not set migrated flag', async () => {
    mockFetchColorNames.mockRejectedValue(new Error('network'));

    const lensPalettesMap: LensPalettesMap = {
      'asset-1': {
        id: 'asset-1',
        uri: 'file:///a.jpg',
        mediaType: 'photo',
        type: COLOR_LENS_MODE.LENS_POINT,
        lensPointColor: { hex: '#AABBCC' },
      },
    };

    const migrationPromise = migrateLensPaletteNamedColors({
      lensPalettesMap,
      onUpdateLensPaletteNamedColors: onUpdate,
      delayMsBetweenPizzaRequests: 10,
    });

    await jest.advanceTimersByTimeAsync(10);
    const result = await migrationPromise;

    expect(result).toEqual({ migratedPaletteCount: 1 });
    expect(onUpdate).toHaveBeenCalledWith('asset-1', [
      expect.objectContaining({
        hex: '#AABBCC',
        pantoneCode: '15-4020',
      }),
    ]);
    expect(onUpdate.mock.calls[0][1][0].name).toBeUndefined();
    expect(mockSaveData).not.toHaveBeenCalledWith(
      StorageDevice.LENS_PALETTES_NAMED_MIGRATED,
      true
    );
  });
});
