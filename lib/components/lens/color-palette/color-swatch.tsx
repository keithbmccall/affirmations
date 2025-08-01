import { useAnimatedColor } from '@features/lens';
import { spacing } from '@styles';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

type ColorSwatchProps = {
  name: string;
  color: SharedValue<string>;
  animationDuration: number;
  animatedStyle?: ViewStyle;
};

const ColorSwatch = ({ color, animationDuration, animatedStyle }: ColorSwatchProps) => {
  const animatedColor = useAnimatedColor(color, animationDuration);
  const animatedBackgroundStyle = useAnimatedStyle(
    () => ({
      backgroundColor: animatedColor.value as string,
    }),
    [animatedColor]
  );

  return <Reanimated.View style={[styles.tile, animatedBackgroundStyle, animatedStyle]} />;
};

const styles = StyleSheet.create({
  tile: {
    padding: 3,
    minWidth: 40,
    minHeight: 40,
    borderRadius: spacing.sm,
  },
});

export default React.memo(ColorSwatch);
