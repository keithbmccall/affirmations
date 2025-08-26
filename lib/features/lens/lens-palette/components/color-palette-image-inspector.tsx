import { globalStyles, spacing } from '@styles';
import { Image } from 'expo-image';
import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { lensPaletteConfig } from '../config';
import type { InspectionAsset, LensPalette } from '../types';

interface ColorPaletteImageInspectorProps {
  image: InspectionAsset;
}

export const ColorPaletteImageInspector = memo(({ image }: ColorPaletteImageInspectorProps) => {
  const [swatch, setSwatch] = useState<string | null>(null);

  const source = useMemo(() => ({ uri: image.uri }), [image.uri]);

  const palette = useMemo(() => {
    const onPress = (swatch: string) => {
      setSwatch(prev => (prev === swatch ? null : swatch));
    };

    return (
      image?.palette && (
        <View style={styles.palette}>
          {lensPaletteConfig.colorPaletteKeys.map(paletteKey => {
            const swatch = image.palette?.[paletteKey as keyof LensPalette['palette']] as string;

            return (
              <Pressable
                key={paletteKey}
                onPress={() => onPress(swatch)}
                style={[styles.swatch, { backgroundColor: swatch as string }]}
              />
            );
          })}
        </View>
      )
    );
  }, [image.palette]);

  const swatchViewStyle = useMemo(() => {
    return {
      ...globalStyles.absolute,
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: swatch ?? undefined,
    };
  }, [swatch]);

  return (
    <View style={styles.container}>
      <View style={styles.paletteCurtain}>
        <Image source={source} style={styles.photoItem} contentFit="cover" />
        {swatch && (
          <View style={swatchViewStyle}>
            <Text>{swatch}</Text>
          </View>
        )}
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
  loadingText: {
    padding: spacing.lg,
  },
});
