import { useAnimatedColor } from '@features/lens';
import React from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

type CameraTileProps = {
  name: string;
  color: Reanimated.SharedValue<string>;
  animationDuration: number;
  animatedStyle?: ViewStyle;
};

const CameraTile = ({ name, color, animationDuration, animatedStyle }: CameraTileProps) => {
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
    minWidth: 60,
    minHeight: 40,
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 2,
    color: 'white',
  },
  colorValue: {
    fontSize: 8,
    fontWeight: 'bold',
    textShadowColor: 'black',
    textShadowOffset: {
      height: 0,
      width: 0,
    },
    textShadowRadius: 1,
    color: 'white',
    marginTop: 2,
  },
  smallerText: {
    fontSize: 12,
  },
});

export default React.memo(CameraTile);
