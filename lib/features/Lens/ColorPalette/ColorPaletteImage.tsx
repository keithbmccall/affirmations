import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import { Image } from 'expo-image';
import { memo, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { lensPaletteConfig } from './lensPaletteConfig';
import type { LensPalette } from './types';
import type { Asset } from 'expo-media-library';

const { width } = Dimensions.get('window');

interface ColorPaletteImageProps {
  image: Asset;
  lensPalette?: LensPalette;
  cellSize?: number;
}

export const ColorPaletteImage = memo(function ColorPaletteImage({
  image,
  lensPalette,
  cellSize,
}: ColorPaletteImageProps) {
  const source = useMemo(() => ({ uri: image.uri }), [image.uri]);

  const cellDimensionsStyle = useMemo(() => {
    const size = cellSize ?? width / 3;

    return { width: size, height: size };
  }, [cellSize]);

  const containerStyle = useMemo(
    () => [styles.container, cellDimensionsStyle],
    [cellDimensionsStyle]
  );

  const imageStyle = useMemo(
    () => [styles.photoItem, cellDimensionsStyle],
    [cellDimensionsStyle]
  );

  const paletteStrip = useMemo(() => {
    if (lensPalette === undefined) return null;

    if (lensPalette.type === COLOR_LENS_MODE.LENS_POINT) {
      return (
        <View style={styles.palette}>
          <View
            testID="lens-point-swatch"
            style={[styles.swatch, { backgroundColor: lensPalette.lensPointColor.hex }]}
          />
        </View>
      );
    }

    return (
      <View style={styles.palette}>
        {lensPaletteConfig.colorPaletteKeys.map(paletteKey => {
          const swatch = lensPalette.palette[paletteKey];

          return (
            <View
              key={paletteKey}
              testID="lens-dominant-swatch"
              style={[styles.swatch, { backgroundColor: swatch.hex }]}
            />
          );
        })}
      </View>
    );
  }, [lensPalette]);

  return (
    <View style={containerStyle}>
      <Image
        recyclingKey={image.id}
        source={source}
        style={imageStyle}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
        priority="high"
      />
      {paletteStrip}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...globalStyles.relative,
  },
  palette: {
    ...globalStyles.absolute,
    left: 0,
    right: 0,
    bottom: 0,
    ...globalStyles.flexRow,
    height: '15%',
  },
  swatch: {
    ...globalStyles.flex1,
  },
  photoItem: {
    borderWidth: 1,
  },
  loadingText: {
    padding: spacing.lg,
  },
});
