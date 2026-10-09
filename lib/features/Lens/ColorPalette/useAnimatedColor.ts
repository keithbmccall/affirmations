import {
  Easing,
  interpolateColor,
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { lensPaletteConfig } from './lensPaletteConfig';

const inputRange = [0, 1];
export const useAnimatedColor = (color: SharedValue<string>, animationDuration: number) => {
  const animation = useSharedValue(0);
  const colorFrom = useSharedValue(lensPaletteConfig.defaultColor);
  // Do not read color.value during React render — sync via useAnimatedReaction.
  const colorTo = useSharedValue(lensPaletteConfig.defaultColor);

  useAnimatedReaction(
    () => color.value,
    newColor => {
      const currentDisplay = interpolateColor(animation.value, inputRange, [
        colorFrom.value,
        colorTo.value,
      ]);
      colorFrom.value = currentDisplay;
      colorTo.value = newColor;
      animation.value = 0;
      animation.value = withTiming(1, {
        duration: animationDuration,
        easing: Easing.in(Easing.cubic),
      });
    }
  );

  return useDerivedValue(() =>
    interpolateColor(animation.value, [0, 1], [colorFrom.value, colorTo.value])
  );
};
