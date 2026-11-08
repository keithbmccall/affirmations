// TEMP: remove after frozen sample UX is validated
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

const INDICATOR_SIZE = 44;

export interface FrozenTapColorIndicatorProps {
  x: number;
  y: number;
  hex: string;
}

export const FrozenTapColorIndicator = memo(function FrozenTapColorIndicator({
  x,
  y,
  hex,
}: FrozenTapColorIndicatorProps) {
  const style = useMemo(
    () => [
      styles.indicator,
      {
        left: x - INDICATOR_SIZE / 2,
        top: y - INDICATOR_SIZE / 2,
        backgroundColor: hex,
      },
    ],
    [hex, x, y]
  );

  return <View testID="lens-frozen-tap-color-indicator" style={style} />;
});

const styles = StyleSheet.create({
  indicator: {
    ...globalStyles.absolute,
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.human.white,
    zIndex: 5,
  },
});
