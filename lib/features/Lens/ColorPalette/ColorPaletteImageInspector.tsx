import { ThemedText } from '@components/shared/ThemedText';
import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import { Image } from 'expo-image';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { lensPaletteConfig } from './lensPaletteConfig';
import type {
  InspectionAsset,
  LensDominantPaletteColors,
  LensNamedColor,
} from './types';

interface ColorPaletteImageInspectorProps {
  image: InspectionAsset;
  onOverlayOpenChange?: (isOpen: boolean) => void;
}

interface SwatchButtonProps {
  swatch: LensNamedColor;
  onSelect: (swatch: LensNamedColor) => void;
}

const toDisplayName = (name: string): string =>
  name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const formatPantoneLabel = (swatch: LensNamedColor): string | undefined => {
  if (swatch.pantoneCode === undefined && swatch.pantoneName === undefined) {
    return undefined;
  }

  const details = [
    swatch.pantoneCode,
    swatch.pantoneName !== undefined ? toDisplayName(swatch.pantoneName) : undefined,
  ]
    .filter((part): part is string => part !== undefined && part !== '')
    .join(' ');

  return `Pantone ${details}`;
};

const SwatchButton = memo(function SwatchButton({ swatch, onSelect }: SwatchButtonProps) {
  const handlePress = useCallback(() => {
    onSelect(swatch);
  }, [onSelect, swatch]);
  const swatchStyle = useMemo(
    () => [styles.swatch, { backgroundColor: swatch.hex }],
    [swatch.hex]
  );

  return <Pressable testID="lens-inspector-swatch" onPress={handlePress} style={swatchStyle} />;
});

export const ColorPaletteImageInspector = memo(function ColorPaletteImageInspector({
  image,
  onOverlayOpenChange,
}: ColorPaletteImageInspectorProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [selectedSwatch, setSelectedSwatch] = useState<LensNamedColor | null>(null);

  const overlayHeight = useSharedValue(0);
  const animatedColor = useSharedValue('transparent');

  const handleSwatchPress = useCallback(
    (swatch: LensNamedColor) => {
      if (isOverlayOpen) {
        if (selectedSwatch?.hex === swatch.hex) {
          setIsOverlayOpen(false);
          setSelectedSwatch(null);
          return;
        }
        setSelectedSwatch(swatch);
        animatedColor.value = withSpring(swatch.hex, {
          damping: 20,
          stiffness: 300,
        });
        return;
      }

      setSelectedSwatch(swatch);
      animatedColor.value = withSpring(swatch.hex, {
        damping: 20,
        stiffness: 300,
      });
      setIsOverlayOpen(true);
    },
    [animatedColor, isOverlayOpen, selectedSwatch?.hex]
  );

  const palette = useMemo(() => {
    if (image.type === COLOR_LENS_MODE.LENS_POINT) {
      return (
        <View style={styles.palette}>
          <SwatchButton swatch={image.lensPointColor} onSelect={handleSwatchPress} />
        </View>
      );
    }

    const dominantPalette =
      image.type === COLOR_LENS_MODE.LENS_DOMINANT
        ? image.palette
        : 'palette' in image
          ? image.palette
          : undefined;

    if (dominantPalette === undefined) return null;

    return (
      <View style={styles.palette}>
        {lensPaletteConfig.colorPaletteKeys.map(paletteKey => {
          const swatch = dominantPalette[paletteKey as keyof LensDominantPaletteColors];

          if (!swatch) return null;

          return <SwatchButton key={paletteKey} swatch={swatch} onSelect={handleSwatchPress} />;
        })}
      </View>
    );
  }, [handleSwatchPress, image]);

  useEffect(() => {
    if (isOverlayOpen) {
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

    onOverlayOpenChange?.(isOverlayOpen);
  }, [isOverlayOpen, onOverlayOpenChange, overlayHeight]);

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

  const closeOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    setSelectedSwatch(null);
  }, []);

  const source = useMemo(() => ({ uri: image.uri }), [image.uri]);

  const pantoneLabel = selectedSwatch !== null ? formatPantoneLabel(selectedSwatch) : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.paletteCurtain}>
        <Image source={source} style={styles.photoItem} contentFit="cover" />
        <Animated.View style={animatedOverlayStyle}>
          {selectedSwatch !== null && (
            <View style={styles.overlayLabels} testID="lens-inspector-overlay-labels">
              {selectedSwatch.name !== undefined ? (
                <ThemedText
                  testID="lens-inspector-color-name"
                  style={styles.overlayPrimaryText}
                  lightColor="#ffffff"
                  darkColor="#ffffff"
                >
                  {selectedSwatch.name}
                </ThemedText>
              ) : null}
              <ThemedText
                testID="lens-inspector-color-hex"
                style={styles.overlaySecondaryText}
                lightColor="#ffffff"
                darkColor="#ffffff"
              >
                {selectedSwatch.hex}
              </ThemedText>
              {pantoneLabel !== undefined ? (
                <ThemedText
                  testID="lens-inspector-color-pantone"
                  style={styles.overlaySecondaryText}
                  lightColor="#ffffff"
                  darkColor="#ffffff"
                >
                  {pantoneLabel}
                </ThemedText>
              ) : null}
            </View>
          )}
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
    ...globalStyles.absoluteFill,
  },
  swatch: {
    ...globalStyles.flex1,
  },
  overlayLabels: {
    ...globalStyles.absolute,
    top: 30,
    left: 30,
    right: 80,
  },
  overlayPrimaryText: {
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  overlaySecondaryText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: spacing.xs,
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
