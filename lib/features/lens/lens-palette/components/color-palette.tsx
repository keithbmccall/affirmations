import { globalStyles, spacing } from '@styles';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { lensPaletteConfig } from '../config';
import { useColorLensPalette } from '../use-color-lens-palette';
import { ColorSwatch } from './color-swatch';

interface ColorPaletteProps {
  palette: ReturnType<typeof useColorLensPalette>['palette'];
  /** Duration for color transition animations in milliseconds */
  animationDuration: number;
  style?: ViewStyle;
}

export const ColorPalette = ({ palette, animationDuration, style }: ColorPaletteProps) => {
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
};

const styles = StyleSheet.create({
  colorPaletteGrid: {
    ...globalStyles.justifyCenter,
    ...globalStyles.alignCenter,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
});
