import { COLOR_LENS_MODE, type ColorLensMode } from './colorLensMode';
import { ColorLensPaletteType, getColorLensPalette } from './getColorLensPalette';
import { lensPaletteConfig } from './lensPaletteConfig';
import { useSharedValue } from 'react-native-reanimated';
import { Frame } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import { useCallback, useMemo, useState } from 'react';

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

  const applyColorPalette = useCallback(
    (colorPalette: ColorLensPaletteType | null) => {
      primaryColor.value = colorPalette?.primary ?? primaryColor.value;
      secondaryColor.value = colorPalette?.secondary ?? secondaryColor.value;
      tertiaryColor.value = colorPalette?.tertiary ?? tertiaryColor.value;
      quaternaryColor.value = colorPalette?.quaternary ?? quaternaryColor.value;
      quinaryColor.value = colorPalette?.quinary ?? quinaryColor.value;
      senaryColor.value = colorPalette?.senary ?? senaryColor.value;
      backgroundColor.value = colorPalette?.background ?? backgroundColor.value;
      detailColor.value = colorPalette?.detail ?? detailColor.value;
    },
    // SharedValues from useSharedValue have stable identity — their object reference
    // never changes across renders, only .value mutates. Empty deps is correct here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const applyColorPaletteWorklet = useMemo(
    () => Worklets.createRunOnJS(applyColorPalette),
    [applyColorPalette]
  );

  const getColorLensPaletteWorklet = useCallback(
    (frame: Frame) => {
      'worklet';
      applyColorPaletteWorklet(getColorLensPalette(frame));
    },
    [applyColorPaletteWorklet]
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
