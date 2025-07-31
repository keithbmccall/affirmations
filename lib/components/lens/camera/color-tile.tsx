import { useAnimatedColor } from '@features/lens';
import React from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

type ColorTileProps = {
  name: string;
  color: Reanimated.SharedValue<string>;
  animationDuration: number;
  animatedStyle?: ViewStyle;
};

const ColorTile = ({ name, color, animationDuration, animatedStyle }: ColorTileProps) => {
  console.log({ color });
  const animatedColor = useAnimatedColor(color, animationDuration);
  const animatedBackgroundStyle = useAnimatedStyle(
    () => ({
      backgroundColor: animatedColor.value,
    }),
    [animatedColor]
  );

  return (
    <Reanimated.View style={[styles.tile, animatedBackgroundStyle, animatedStyle]}>
      <Text style={styles.text}>{name}</Text>
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 2,
    color: 'white',
  },
  smallerText: {
    fontSize: 12,
  },
});

export default React.memo(ColorTile);
