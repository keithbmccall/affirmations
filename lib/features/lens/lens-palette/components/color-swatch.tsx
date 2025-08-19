import { spacing } from '@styles';
import React, { memo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useAnimatedColor } from '../use-animated-color';

type ColorSwatchProps = {
  color: SharedValue<string>;
  animationDuration: number;
  animatedStyle?: ViewStyle;
};

export const ColorSwatch = memo(({ color, animationDuration, animatedStyle }: ColorSwatchProps) => {
  const animatedColor = useAnimatedColor(color, animationDuration);
  const animatedBackgroundStyle = useAnimatedStyle(
    () => ({
      backgroundColor: animatedColor.value as string,
    }),
    [animatedColor]
  );

  return <Reanimated.View style={[styles.tile, animatedBackgroundStyle, animatedStyle]} />;
});

const styles = StyleSheet.create({
  tile: {
    padding: 3,
    minWidth: 40,
    minHeight: 40,
    borderRadius: spacing.sm,
  },
});
