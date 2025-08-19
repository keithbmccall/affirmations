import {
  Easing,
  interpolateColor,
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { lensPaletteConfig } from './config';

export const useAnimatedColor = (color: SharedValue<string>, animationDuration: number) => {
  const animation = useSharedValue(0);
  const colorFrom = useSharedValue(lensPaletteConfig.defaultColor);
  const colorTo = useSharedValue(color.value);

  useAnimatedReaction(
    () => color.value,
    (newColor, prevColor) => {
      animation.value = 0;
      colorFrom.value = prevColor ?? lensPaletteConfig.defaultColor;
      colorTo.value = newColor;
      animation.value = withTiming(1, {
        duration: animationDuration,
        easing: Easing.linear,
      });
    }
  );

  // TODO: Using colorFrom and colorTo in here raises "Attempting to assign to readonly property" error...
  return useDerivedValue(() =>
    interpolateColor(animation.value, [0, 1], [colorFrom.value, colorTo.value])
  );
};
