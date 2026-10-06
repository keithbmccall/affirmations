import { useCallback } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { Frame } from 'react-native-vision-camera';
import { type ColorLensRegionOptions, getColorLensRegion } from './getColorLensRegion';
import { lensPaletteConfig } from './lensPaletteConfig';

export const useColorLensRegion = () => {
  const regionColor = useSharedValue(lensPaletteConfig.defaultColor);

  const getColorLensRegionWorklet = useCallback(
    (frame: Frame, options: ColorLensRegionOptions) => {
      'worklet';
      const color = getColorLensRegion(frame, options);
      if (color !== null) {
        regionColor.value = color;
      }
    },
    // SharedValues are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return { regionColor, getColorLensRegionWorklet };
};
