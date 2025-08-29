import { ThemedText } from '@components/shared';
import { globalStyles, spacing } from '@styles';
import { Image } from 'expo-image';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { lensPaletteConfig } from '../config';
import type { InspectionAsset, LensPalette } from '../types';

interface ColorPaletteImageInspectorProps {
  image: InspectionAsset;
}

export const ColorPaletteImageInspector = memo(({ image }: ColorPaletteImageInspectorProps) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const overlayHeight = useSharedValue(0);
  // Shared value to store the current swatch color
  const swatchColor = useSharedValue<string | null>(null);
  // Shared value to store the current animated color
  const animatedColor = useSharedValue('transparent');

  const palette = useMemo(() => {
    const onPress = (_swatch: string) => {
      // setIsOverlayOpen(prev => !prev);
      if (isOverlayOpen) {
        if (swatchColor.value === _swatch) {
          setIsOverlayOpen(false);
        } else {
          // change to another swatch
          swatchColor.value = _swatch;
          animatedColor.value = withSpring(_swatch, {
            damping: 20,
            stiffness: 300,
          });
        }
      } else {
        swatchColor.value = _swatch;
        animatedColor.value = withSpring(_swatch, {
          damping: 20,
          stiffness: 300,
        });
        setIsOverlayOpen(true);
      }
    };

    return (
      image.palette && (
        <View style={styles.palette}>
          {lensPaletteConfig.colorPaletteKeys.map(paletteKey => {
            const swatch = image.palette?.[paletteKey as keyof LensPalette['palette']];

            if (!swatch) return null;

            return (
              <Pressable
                key={paletteKey}
                onPress={() => onPress(swatch)}
                style={[styles.swatch, { backgroundColor: swatch }]}
              />
            );
          })}
        </View>
      )
    );
  }, [image.palette, isOverlayOpen, swatchColor, animatedColor]);

  // Trigger animation when swatch state changes
  useEffect(() => {
    if (isOverlayOpen) {
      // Animate to full height when swatch is selected
      overlayHeight.value = withSpring(1, {
        damping: 12,
        stiffness: 180,
      });
    } else {
      overlayHeight.value = withSpring(0, {
        damping: 15,
        stiffness: 200,
      });
    }
  }, [overlayHeight, isOverlayOpen]);

  // Handle color changes for smooth blending - moved to onPress handler
  // No useEffect needed since we update animatedColor directly when swatchColor changes

  // Animated style for the growing overlay effect with color interpolation
  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      ...globalStyles.absolute,
      left: 0,
      right: 0,
      bottom: 0,
      height: `${overlayHeight.value * 100}%`,
      backgroundColor: animatedColor.value,
      ...globalStyles.flexCenter,
    };
  });

  // Animated text style that shows/hides text based on swatch value
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '600',
      ...globalStyles.absolute,
      top: 30,
      left: 30,
      opacity: swatchColor.value ? 1 : 0,
    };
  });

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
  }, []);

  const source = useMemo(() => ({ uri: image.uri }), [image.uri]);

  return (
    <View style={styles.container}>
      <View style={styles.paletteCurtain}>
        <Image source={source} style={styles.photoItem} contentFit="cover" />
        <Animated.View style={animatedOverlayStyle}>
          <Animated.Text style={animatedTextStyle}>{swatchColor.value}</Animated.Text>
          <Pressable onPress={closeOverlay} style={styles.closeOverlayButton}>
            <ThemedText>Close</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
      {palette}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
  },
  palette: {
    left: 0,
    right: 0,
    bottom: 0,
    ...globalStyles.flexRow,
    height: '20%',
  },
  paletteCurtain: {
    ...globalStyles.flex1,
    ...globalStyles.relative,
  },
  photoItem: {
    ...globalStyles.flex1,
  },
  swatch: {
    ...globalStyles.flex1,
  },
  swatchText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeOverlayButton: {
    ...globalStyles.absolute,
    top: 30,
    right: 30,
  },
  loadingText: {
    padding: spacing.lg,
  },
});
