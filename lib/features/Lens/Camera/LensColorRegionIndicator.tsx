import { useAnimatedColor } from '@features/Lens/ColorPalette/useAnimatedColor';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { memo, useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, LayoutRectangle, StyleSheet, View } from 'react-native';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { getLensPointSampleRect, LENS_POINT_REGION } from './lensPointSampleRegion';

interface LensColorRegionIndicatorProps {
  color: SharedValue<string>;
  animationDuration: number;
}

const INITIAL_LAYOUT: LayoutRectangle = { x: 0, y: 0, width: 0, height: 0 };

export const LensColorRegionIndicator = memo(function LensColorRegionIndicator({
  color,
  animationDuration,
}: LensColorRegionIndicatorProps) {
  const [layoutSize, setLayoutSize] = useState<LayoutRectangle>(INITIAL_LAYOUT);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setLayoutSize(event.nativeEvent.layout);
  }, []);

  const sampleRect = getLensPointSampleRect(layoutSize);

  const circleStyle = useMemo(
    () => ({
      width: sampleRect.size,
      height: sampleRect.size,
      borderRadius: sampleRect.size / 2,
      borderWidth: LENS_POINT_REGION.borderWidth,
    }),
    [sampleRect.size]
  );

  const animatedColor = useAnimatedColor(color, animationDuration);
  const animatedBorderStyle = useAnimatedStyle(
    () => ({
      borderColor: animatedColor.value as string,
    }),
    [animatedColor]
  );

  const circleCombinedStyle = useMemo(
    () => [styles.circle, circleStyle, animatedBorderStyle],
    [animatedBorderStyle, circleStyle]
  );

  return (
    <View
      testID="lens-color-region-indicator-container"
      style={styles.container}
      pointerEvents="none"
      onLayout={handleLayout}
    >
      {sampleRect.size > 0 ? (
        <Reanimated.View testID="lens-color-region-indicator" style={circleCombinedStyle} />
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
    backgroundColor: colors.human.transparent,
  },
});
