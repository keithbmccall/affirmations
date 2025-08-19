import { useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import { Frame } from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';
import { ColorLensPaletteType, getColorLensPalette } from './get-color-lens-palette';
import { DEFAULT_COLOR } from './consts';


export const useColorLensPalette = () => {
  const [isColorLensEnabled, setIsColorLensEnabled] = useState(false);

  const primaryColor = useSharedValue(DEFAULT_COLOR);
  const secondaryColor = useSharedValue(DEFAULT_COLOR);
  const tertiaryColor = useSharedValue(DEFAULT_COLOR);
  const quaternaryColor = useSharedValue(DEFAULT_COLOR);
  const quinaryColor = useSharedValue(DEFAULT_COLOR);
  const senaryColor = useSharedValue(DEFAULT_COLOR);
  const backgroundColor = useSharedValue(DEFAULT_COLOR);
  const detailColor = useSharedValue(DEFAULT_COLOR);

  const applyColorPalette = (colorPalette: ColorLensPaletteType | null) => {
    primaryColor.value = colorPalette?.primary ?? primaryColor.value;
    secondaryColor.value = colorPalette?.secondary ?? secondaryColor.value;
    tertiaryColor.value = colorPalette?.tertiary ?? tertiaryColor.value;
    quaternaryColor.value = colorPalette?.quaternary ?? quaternaryColor.value;
    quinaryColor.value = colorPalette?.quinary ?? quinaryColor.value;
    senaryColor.value = colorPalette?.senary ?? senaryColor.value;
    backgroundColor.value = colorPalette?.background ?? backgroundColor.value;
    detailColor.value = colorPalette?.detail ?? detailColor.value;
  };
  const applyColorPaletteWorklet = Worklets.createRunOnJS(applyColorPalette);

  const getColorLensPaletteWorklet = (frame: Frame) => {
    'worklet';
    applyColorPaletteWorklet(getColorLensPalette(frame));
  };

  const palette = {
    primaryColor,
    secondaryColor,
    tertiaryColor,
    quaternaryColor,
    quinaryColor,
    senaryColor,
    backgroundColor,
    detailColor,
  };

  return {
    isColorLensEnabled,
    setIsColorLensEnabled,
    palette,
    getColorLensPaletteWorklet,
  };
};
