import { useAnimatedColor } from '@features/Lens/ColorPalette/useAnimatedColor';
import { globalStyles } from '@styles/globalStyles';
import { memo, useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, LayoutRectangle, StyleSheet, View } from 'react-native';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { getRegionDiameter } from './lensPointSampleRegion';

interface LensColorRegionIndicatorProps {
  color: SharedValue<string>;
  animationDuration: number;
}

const HAIR_THICKNESS = 0.5;
const INITIAL_LAYOUT: LayoutRectangle = { x: 0, y: 0, width: 0, height: 0 };

export const LensColorRegionIndicator = memo(function LensColorRegionIndicator({
  color,
  animationDuration,
}: LensColorRegionIndicatorProps) {
  const [layoutSize, setLayoutSize] = useState<LayoutRectangle>(INITIAL_LAYOUT);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setLayoutSize(event.nativeEvent.layout);
  }, []);

  const diameter = getRegionDiameter(layoutSize);

  const circleStyle = useMemo(
    () => ({
      width: diameter,
      height: diameter,
      borderRadius: diameter / 2,
    }),
    [diameter]
  );

  const animatedColor = useAnimatedColor(color, animationDuration);
  const animatedBorderStyle = useAnimatedStyle(
    () => ({
      borderColor: animatedColor.value as string,
    }),
    [animatedColor]
  );
  const animatedHairStyle = useAnimatedStyle(
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
          style={[styles.circle, circleStyle, animatedBorderStyle]}
        >
          <Reanimated.View
            testID="lens-color-region-hair-h"
            style={[styles.hairHorizontal, animatedHairStyle]}
          />
          <Reanimated.View
            testID="lens-color-region-hair-v"
            style={[styles.hairVertical, animatedHairStyle]}
          />
        </Reanimated.View>
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
    ...globalStyles.flexCenter,
    backgroundColor: 'transparent',
    borderWidth: 7,
    overflow: 'hidden',
  },
  hairHorizontal: {
    ...globalStyles.absolute,
    width: '100%',
    height: HAIR_THICKNESS,
  },
  hairVertical: {
    ...globalStyles.absolute,
    height: '100%',
    width: HAIR_THICKNESS,
  },
});
