import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useAnimatedColor } from './useAnimatedColor';
import { lensPaletteConfig } from './lensPaletteConfig';
import { useColorLensPalette } from './useColorLensPalette';

type ColorSwatchProps = {
  color: SharedValue<string>;
  animationDuration: number;
  animatedStyle?: ViewStyle;
};

const ColorSwatch = memo(function ColorSwatch({
  color,
  animationDuration,
  animatedStyle,
}: ColorSwatchProps) {
  const animatedColor = useAnimatedColor(color, animationDuration);
  const animatedBackgroundStyle = useAnimatedStyle(
    () => ({
      backgroundColor: animatedColor.value as string,
    }),
    [animatedColor]
  );

  return <Reanimated.View style={[styles.tile, animatedBackgroundStyle, animatedStyle]} />;
});

interface ColorPaletteProps {
  palette: ReturnType<typeof useColorLensPalette>['palette'];
  /** Duration for color transition animations in milliseconds */
  animationDuration: number;
  style?: ViewStyle;
}

export const ColorPalette = memo(function ColorPalette({
  palette,
  animationDuration,
  style,
}: ColorPaletteProps) {
  return (
    <View style={[styles.colorPaletteGrid, style]}>
      {lensPaletteConfig.colorPaletteKeys.map(paletteKey => {
        const swatch = palette[paletteKey as keyof typeof palette];

        return (
          <ColorSwatch key={paletteKey} color={swatch} animationDuration={animationDuration} />
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  tile: {
    padding: 3,
    minWidth: 35,
    minHeight: 35,
    borderRadius: spacing.sm,
  },
  colorPaletteGrid: {
    ...globalStyles.justifyCenter,
    ...globalStyles.alignCenter,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
});
