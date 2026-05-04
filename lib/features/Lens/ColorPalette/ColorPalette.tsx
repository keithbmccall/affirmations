import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import React, { memo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { lensPaletteConfig } from './lensPaletteConfig';
import { useColorLensPalette } from './useColorLensPalette';
import { ColorSwatch } from './ColorSwatch';

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
  colorPaletteGrid: {
    ...globalStyles.justifyCenter,
    ...globalStyles.alignCenter,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
});
