import { useCallback, useMemo, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { Frame } from 'react-native-vision-camera';
import { COLOR_LENS_MODE, type ColorLensMode } from './colorLensMode';
import {
  type ColorLensPaletteOptions,
  type ColorLensPaletteType,
  getColorLensPalette,
} from './getColorLensPalette';
import { lensPaletteConfig } from './lensPaletteConfig';

export const useColorLensPalette = () => {
  const [colorLensMode, setColorLensMode] = useState<ColorLensMode>(COLOR_LENS_MODE.DISABLED);

  const primaryColor = useSharedValue(lensPaletteConfig.defaultColor);
  const secondaryColor = useSharedValue(lensPaletteConfig.defaultColor);
  const tertiaryColor = useSharedValue(lensPaletteConfig.defaultColor);
  const quaternaryColor = useSharedValue(lensPaletteConfig.defaultColor);
  const quinaryColor = useSharedValue(lensPaletteConfig.defaultColor);
  const senaryColor = useSharedValue(lensPaletteConfig.defaultColor);
  const backgroundColor = useSharedValue(lensPaletteConfig.defaultColor);
  const detailColor = useSharedValue(lensPaletteConfig.defaultColor);

  const getColorLensPaletteWorklet = useCallback(
    (frame: Frame, options: ColorLensPaletteOptions) => {
      'worklet';
      const colorPalette: ColorLensPaletteType | null = getColorLensPalette(frame, options);
      if (colorPalette === null) {
        return;
      }
      // Vision Camera v5 + react-native-worklets: mutate SharedValues on the frame thread.
      primaryColor.value = colorPalette.primary;
      secondaryColor.value = colorPalette.secondary;
      tertiaryColor.value = colorPalette.tertiary;
      quaternaryColor.value = colorPalette.quaternary;
      quinaryColor.value = colorPalette.quinary;
      senaryColor.value = colorPalette.senary;
      backgroundColor.value = colorPalette.background;
      detailColor.value = colorPalette.detail;
    },
    // SharedValues are stable refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const palette = useMemo(
    () => ({
      primaryColor,
      secondaryColor,
      tertiaryColor,
      quaternaryColor,
      quinaryColor,
      senaryColor,
      backgroundColor,
      detailColor,
    }),
    // SharedValues are stable refs — this object is computed once at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    colorLensMode,
    setColorLensMode,
    palette,
    getColorLensPaletteWorklet,
  };
};
