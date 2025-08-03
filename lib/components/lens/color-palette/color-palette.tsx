import type { useColorLensPalette } from '@features/lens';
import { globalStyles, spacing } from '@styles';
import { capitalizeFirstLetter } from '@utils';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import ColorSwatch from './color-swatch';

interface ColorPaletteProps {
  palette: ReturnType<typeof useColorLensPalette>['palette'];
  /** Duration for color transition animations in milliseconds */
  animationDuration: number;
  style?: ViewStyle;
}

export const ColorPalette = ({ palette, animationDuration, style }: ColorPaletteProps) => {
  return (
    <View style={[styles.colorPaletteGrid, style]}>
      {Object.keys(palette).map(paletteKey => {
        const key = paletteKey.split('Color')[0];
        const name = capitalizeFirstLetter(key);
        const swatch = palette[paletteKey as keyof typeof palette];

        return (
          <ColorSwatch key={key} name={name} color={swatch} animationDuration={animationDuration} />
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
