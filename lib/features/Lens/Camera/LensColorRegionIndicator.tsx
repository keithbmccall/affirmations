import { useAnimatedColor } from '@features/Lens/ColorPalette/useAnimatedColor';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { memo, useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, LayoutRectangle, StyleSheet, View } from 'react-native';
import Reanimated, { SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import {
  getRegionDiameter,
  getRegionHaloDiameter,
  LENS_POINT_REGION,
} from './lensPointSampleRegion';

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

  const diameter = getRegionDiameter(layoutSize);
  const haloDiameter = getRegionHaloDiameter(layoutSize);

  const circleStyle = useMemo(
    () => ({
      width: diameter,
      height: diameter,
      borderRadius: diameter / 2,
      borderWidth: LENS_POINT_REGION.innerBorderWidth,
    }),
    [diameter]
  );

  const haloStyle = useMemo(
    () => ({
      borderRadius: haloDiameter / 2,
      borderWidth: LENS_POINT_REGION.haloBorderWidth,
      opacity: LENS_POINT_REGION.haloBorderOpacity,
    }),
    [haloDiameter]
  );

  const ringsHostStyle = useMemo(
    () => ({
      width: haloDiameter,
      height: haloDiameter,
    }),
    [haloDiameter]
  );

  const animatedColor = useAnimatedColor(color, animationDuration);
  const animatedBorderStyle = useAnimatedStyle(
    () => ({
      borderColor: animatedColor.value as string,
    }),
    [animatedColor]
  );

  const ringsHostCombinedStyle = useMemo(
    () => [styles.ringsHost, ringsHostStyle],
    [ringsHostStyle]
  );

  const haloCombinedStyle = useMemo(
    () => [styles.haloRing, StyleSheet.absoluteFillObject, haloStyle, animatedBorderStyle],
    [animatedBorderStyle, haloStyle]
  );

  const innerCombinedStyle = useMemo(
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
      {diameter > 0 ? (
        <View testID="lens-color-region-rings-host" style={ringsHostCombinedStyle}>
          <Reanimated.View
            testID="lens-color-region-halo"
            style={haloCombinedStyle}
          />
          <Reanimated.View
            testID="lens-color-region-indicator"
            style={innerCombinedStyle}
          />
        </View>
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
  ringsHost: {
    ...globalStyles.relative,
    ...globalStyles.flexCenter,
  },
  haloRing: {
    backgroundColor: colors.human.transparent,
  },
  circle: {
    backgroundColor: colors.human.transparent,
  },
});
