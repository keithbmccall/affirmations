import { useAnimatedColor } from '@features/Lens/ColorPalette/useAnimatedColor';
import { globalStyles } from '@styles/globalStyles';
import { memo, useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

interface LensColorRegionIndicatorProps {
  color: SharedValue<string>;
  radius: number;
  animationDuration: number;
}

export const LensColorRegionIndicator = memo(function LensColorRegionIndicator({
  color,
  radius,
  animationDuration,
}: LensColorRegionIndicatorProps) {
  const [layoutSize, setLayoutSize] = useState({ width: 0, height: 0 });

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayoutSize({ width, height });
  }, []);

  const diameter = useMemo(() => {
    const shortSide = Math.min(layoutSize.width, layoutSize.height);
    if (shortSide <= 0) {
      return 0;
    }
    return 2 * radius * shortSide;
  }, [layoutSize.height, layoutSize.width, radius]);

  const circleStyle = useMemo(
    () => ({
      width: diameter,
      height: diameter,
      borderRadius: diameter / 2,
    }),
    [diameter]
  );

  const animatedColor = useAnimatedColor(color, animationDuration);
  const animatedBackgroundStyle = useAnimatedStyle(
    () => ({
      backgroundColor: animatedColor.value as string,
    }),
    [animatedColor]
  );

  return (
    <View
      testID="lens-color-region-indicator-container"
      style={styles.container}
      pointerEvents="none"
      onLayout={handleLayout}
    >
      {diameter > 0 ? (
        <Reanimated.View
          testID="lens-color-region-indicator"
          style={[styles.circle, circleStyle, animatedBackgroundStyle]}
        />
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...globalStyles.absoluteFill,
    ...globalStyles.flexCenter,
    zIndex: 5,
  },
  circle: {
    ...globalStyles.alignCenter,
    ...globalStyles.justifyCenter,
  },
});
