import {
  getColorLensProcessor,
  type ColorLensRegionPixels,
} from 'expo-color-lens-frame-processor';
import { useCallback, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { Frame } from 'react-native-vision-camera';
import {
  type ColorLensRegionOptions,
  copyColorLensRegion,
  extractColorLensRegionColor,
} from './getColorLensRegion';
import { lensPaletteConfig } from './lensPaletteConfig';

export const useColorLensRegion = () => {
  const regionColor = useSharedValue(lensPaletteConfig.defaultColor);

  // Create on RN JS thread; HybridObject methods are host functions usable from the frame runtime.
  const processor = useMemo(() => getColorLensProcessor(), []);

  const copyColorLensRegionWorklet = useCallback(
    (frame: Frame, options: ColorLensRegionOptions): ColorLensRegionPixels | null => {
      'worklet';
      return copyColorLensRegion(processor, frame, options);
    },
    // processor is a stable ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [processor]
  );

  const applyColorLensRegionColorWorklet = useCallback(
    (region: ColorLensRegionPixels) => {
      'worklet';
      const color = extractColorLensRegionColor(processor, region);
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
    copyColorLensRegionWorklet,
    applyColorLensRegionColorWorklet,
  };
};
