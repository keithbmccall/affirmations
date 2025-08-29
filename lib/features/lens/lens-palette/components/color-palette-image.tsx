import { globalStyles, spacing } from '@styles';
import { Image } from 'expo-image';
import type { Asset } from 'expo-media-library';
import { memo, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { lensPaletteConfig } from '../config';
import type { LensPalette } from '../types';

const { width } = Dimensions.get('window');

interface ColorPaletteImageProps {
  image: Asset;
  lensPalette: LensPalette;
}

export const ColorPaletteImage = memo(({ image, lensPalette }: ColorPaletteImageProps) => {
  console.log({ item: image, lensPalette });
  const source = useMemo(() => ({ uri: image.uri }), [image.uri]);
  return (
    <View style={styles.container}>
      <Image source={source} style={styles.photoItem} contentFit="cover" />
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
    width: width / 3, // Subtract 2 for the border width
    height: width / 3, // Subtract 2 for the border width
    borderWidth: 1,
  },
  loadingText: {
    padding: spacing.lg,
  },
});
