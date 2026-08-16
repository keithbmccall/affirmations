import { useCallback, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { Frame } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import { ColorLensRegionOptions, getColorLensRegion } from './getColorLensRegion';
import { lensPaletteConfig } from './lensPaletteConfig';

export const useColorLensRegion = () => {
  const regionColor = useSharedValue(lensPaletteConfig.defaultColor);

  // SharedValues from useSharedValue have stable identity — empty deps is correct.
  const applyRegionColorWorklet = useMemo(
    () =>
      Worklets.createRunOnJS((color: string | null) => {
        if (color !== null) {
          regionColor.value = color ?? regionColor.value;
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getColorLensRegionWorklet = useCallback(
    (frame: Frame, options: ColorLensRegionOptions) => {
      'worklet';
      applyRegionColorWorklet(getColorLensRegion(frame, options));
    },
    [applyRegionColorWorklet]
  );

  return { regionColor, getColorLensRegionWorklet };
};
