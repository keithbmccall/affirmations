import { useCallback, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { Frame } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import { ColorLensRegionOptions, getColorLensRegion } from './getColorLensRegion';
import { lensPaletteConfig } from './lensPaletteConfig';

export const useColorLensRegion = () => {
  const regionColor = useSharedValue(lensPaletteConfig.defaultColor);

  const applyRegionColor = useCallback(
    (color: string | null) => {
      if (color !== null) {
        regionColor.value = color ?? regionColor.value;
      }
    },
    [regionColor]
  );

  const applyRegionColorWorklet = useMemo(
    () => Worklets.createRunOnJS(applyRegionColor),
    [applyRegionColor]
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
