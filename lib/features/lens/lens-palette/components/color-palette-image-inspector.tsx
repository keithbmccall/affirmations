import { globalStyles, spacing } from '@styles';
import { Image } from 'expo-image';
import { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { lensPaletteConfig } from '../config';
import type { InspectionAsset, LensPalette } from '../types';

interface ColorPaletteImageInspectorProps {
  image: InspectionAsset;
}

export const ColorPaletteImageInspector = memo(({ image }: ColorPaletteImageInspectorProps) => {
  const [swatch, setSwatch] = useState<string | null>(null);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const overlayHeight = useSharedValue(0);

  const palette = useMemo(() => {
    const onPress = (_swatch: string) => {
      // setIsOverlayOpen(prev => !prev);
      if (isOverlayOpen) {
        if (swatch === _swatch) {
          setIsOverlayOpen(false);
        } else {
          // change to another swatch
          setSwatch(_swatch);
        }
      } else {
        setSwatch(_swatch);
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
  }, [image.palette, isOverlayOpen, swatch]);

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
  }, [swatch, overlayHeight, isOverlayOpen]);

  // Animated style for the growing overlay effect
  const animatedOverlayStyle = useAnimatedStyle(() => {
    return {
      ...globalStyles.absolute,
      left: 0,
      right: 0,
      bottom: 0,
      height: `${overlayHeight.value * 100}%`,
      backgroundColor: swatch ?? 'transparent',
      ...globalStyles.flexCenter,
    };
  });

  const source = useMemo(() => ({ uri: image.uri }), [image.uri]);

  return (
    <View style={styles.container}>
      <View style={styles.paletteCurtain}>
        <Image source={source} style={styles.photoItem} contentFit="cover" />
        <Animated.View style={animatedOverlayStyle}>
          {swatch && <Text style={styles.swatchText}>{swatch}</Text>}
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
  loadingText: {
    padding: spacing.lg,
  },
});
