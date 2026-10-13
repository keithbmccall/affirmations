import { getColorLensProcessor } from 'expo-color-lens-frame-processor';
import { useCallback, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { Frame } from 'react-native-vision-camera';
import {
  type ColorLensRegionOptions,
  getColorLensRegionColor,
} from './getColorLensRegion';
import { lensPaletteConfig } from './lensPaletteConfig';

export const useColorLensRegion = () => {
  const regionColor = useSharedValue(lensPaletteConfig.defaultColor);

  // Create on RN JS thread; HybridObject methods are host functions usable from the frame runtime.
  const processor = useMemo(() => getColorLensProcessor(), []);

  const applyColorLensRegionWorklet = useCallback(
    (frame: Frame, options: ColorLensRegionOptions) => {
      'worklet';
      const color = getColorLensRegionColor(processor, frame, options);
      if (color !== null) {
        regionColor.value = color;
      }
    },
    // processor + SharedValues are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processor]
  );

  return {
    regionColor,
    applyColorLensRegionWorklet,
  };
};
