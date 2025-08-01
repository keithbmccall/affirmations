import { globalStyles, spacing } from '@styles';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import ColorSwatch from './color-swatch';

interface ColorPaletteProps {
  palette: {
    /** The most dominant color in the image */
    primaryColor: SharedValue<string>;
    /** The second most dominant color in the image */
    secondaryColor: SharedValue<string>;
    /** The third most dominant color in the image */
    tertiaryColor: SharedValue<string>;
    /** The fourth most dominant color in the image */
    quaternaryColor: SharedValue<string>;
    /** The fifth most dominant color in the image */
    quinaryColor: SharedValue<string>;
    /** The sixth most dominant color in the image */
    senaryColor: SharedValue<string>;
    /** The most frequent background color in the image */
    backgroundColor: SharedValue<string>;
    /** A subtle accent or detail color in the image */
    detailColor: SharedValue<string>;
  };
  /** Duration for color transition animations in milliseconds */
  animationDuration: number;
  style?: ViewStyle;
}

export const ColorPalette = ({
  palette: {
    primaryColor,
    secondaryColor,
    tertiaryColor,
    quaternaryColor,
    quinaryColor,
    senaryColor,
    backgroundColor,
    detailColor,
  },
  animationDuration,
  style,
}: ColorPaletteProps) => {
  return (
    <View style={[styles.colorPaletteGrid, style]}>
      <ColorSwatch
        key="primary"
        name="Primary"
        color={primaryColor}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="secondary"
        name="Secondary"
        color={secondaryColor}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="tertiary"
        name="Tertiary"
        color={tertiaryColor}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="quaternary"
        name="Quaternary"
        color={quaternaryColor}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="quinary"
        name="Quinary"
        color={quinaryColor}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="senary"
        name="Senary"
        color={senaryColor}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="background"
        name="Background"
        color={backgroundColor}
        animationDuration={animationDuration}
      />
      <ColorSwatch
        key="detail"
        name="Detail"
        color={detailColor}
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
