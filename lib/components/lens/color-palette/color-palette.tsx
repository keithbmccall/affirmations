import { globalStyles, spacing } from '@styles';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import ColorSwatch from './color-swatch';

interface ColorPaletteProps {
  /** The most dominant color in the image */
  primary: SharedValue<string>;
  /** The second most dominant color in the image */
  secondary: SharedValue<string>;
  /** The third most dominant color in the image */
  tertiary: SharedValue<string>;
  /** The fourth most dominant color in the image */
  quaternary: SharedValue<string>;
  /** The fifth most dominant color in the image */
  quinary: SharedValue<string>;
  /** The sixth most dominant color in the image */
  senary: SharedValue<string>;
  /** The most frequent background color in the image */
  background: SharedValue<string>;
  /** A subtle accent or detail color in the image */
  detail: SharedValue<string>;
  /** Duration for color transition animations in milliseconds */
  animationDuration: number;
}

export const ColorPalette = ({
  primary,
  secondary,
  tertiary,
  quaternary,
  quinary,
  senary,
  background,
  detail,
  animationDuration,
}: ColorPaletteProps) => {
  return (
    <View style={[styles.colorPaletteGrid]}>
      <ColorSwatch
        key="primary"
        name="Primary"
        color={primary}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="secondary"
        name="Secondary"
        color={secondary}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="tertiary"
        name="Tertiary"
        color={tertiary}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="quaternary"
        name="Quaternary"
        color={quaternary}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="quinary"
        name="Quinary"
        color={quinary}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="senary"
        name="Senary"
        color={senary}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="background"
        name="Background"
        color={background}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="detail"
        name="Detail"
        color={detail}
        animationDuration={animationDuration}
      />
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
