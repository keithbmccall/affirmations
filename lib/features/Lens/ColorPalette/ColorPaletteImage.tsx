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
      {lensPalette && (
        <View style={styles.palette}>
          {lensPaletteConfig.colorPaletteKeys.map(paletteKey => {
            const swatch = lensPalette.palette[paletteKey as keyof typeof lensPalette.palette];

            return (
              <View
                key={paletteKey}
                style={[styles.swatch, { backgroundColor: swatch as string }]}
              />
            );
          })}
        </View>
      )}
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
