import { Modal } from '@components/Modal';
import { ThemedText } from '@components/shared/ThemedText';
import { ColorPaletteImage } from '@features/Lens/ColorPalette/ColorPaletteImage';
import type { InspectionAsset, LensPalette } from '@features/Lens/ColorPalette/types';
import {
  CAMERA_ROLL_GRID_CELL_SIZE,
  CAMERA_ROLL_NUM_COLUMNS,
} from '@features/Lens/Camera/cameraRollPhotos/cameraRollGridLayout';
import { useLensCameraRollPhotos } from '@features/Lens/Camera/hooks/useLensCameraRollPhotos';
import { useLens } from '@platform';
import { Routes } from '@routes/routes';
import { useThemeColor } from '@styles/hooks/useThemeColor';
import { spacing } from '@styles/spacing';
import type { ScreenContainerProps } from '@shared-types/ScreenContainerProps';
import type { Asset } from 'expo-media-library';
import { router } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

const handlePhotoPress = (asset: Asset, lensPalette: LensPalette | undefined) => {
  const item: InspectionAsset = {
    height: asset.height,
    width: asset.width,
    uri: asset.uri,
    mediaType: asset.mediaType,
    id: asset.id,
    palette: lensPalette?.palette,
  };
  router.push({
    pathname: Routes.subRoutes.cameraRollInspector.routePathname,
    params: { asset: JSON.stringify(item) },
  });
};

type LensCameraRollProps = ScreenContainerProps;

interface PhotoGridItemProps {
  item: Asset;
}

const arePhotoGridItemPropsEqual = (prev: PhotoGridItemProps, next: PhotoGridItemProps) => {
  return prev.item.id === next.item.id && prev.item.uri === next.item.uri;
};

const PhotoGridItem = memo(function PhotoGridItem({ item }: PhotoGridItemProps) {
  const { lensPalettesMap } = useLens();
  const lensPalette: LensPalette | undefined = lensPalettesMap[item.id];

  const handlePress = useCallback(() => {
    handlePhotoPress(item, lensPalette);
  }, [item, lensPalette]);

  return (
    <Pressable testID={`lens-photo-grid-${item.id}`} onPress={handlePress}>
      <ColorPaletteImage
        image={item}
        lensPalette={lensPalette}
        cellSize={CAMERA_ROLL_GRID_CELL_SIZE}
      />
    </Pressable>
  );
}, arePhotoGridItemPropsEqual);

export const LensCameraRoll = memo(function LensCameraRoll(_props: LensCameraRollProps) {
  const { photos, loading, error, loadMore } = useLensCameraRollPhotos();
  const borderColor = useThemeColor({}, 'background');

  const contentContainerStyle = useMemo(() => ({ borderColor }), [borderColor]);

  const renderPhoto = useCallback(({ item }: { item: Asset }) => {
    return <PhotoGridItem item={item} />;
  }, []);

  const keyExtractor = useCallback((item: Asset) => item.id, []);

  const handleEndReached = useCallback(() => {
    loadMore();
  }, [loadMore]);

  const listEmptyComponent = useMemo(() => {
    if (error && photos.length === 0) {
      return (
        <ThemedText type="default" style={styles.emptyText}>
          {error}
        </ThemedText>
      );
    }

    if (loading && photos.length === 0) {
      return (
        <ThemedText type="default" style={styles.emptyText}>
          Loading photos...
        </ThemedText>
      );
    }

    if (photos.length === 0) {
      return (
        <ThemedText type="default" style={styles.emptyText}>
          No photos in camera roll
        </ThemedText>
      );
    }

    return null;
  }, [error, loading, photos.length]);

  return (
    <Modal title="Camera Roll" testID="lens-camera-roll-title">
      <FlatList
        testID="lens-camera-roll-list"
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={keyExtractor}
        numColumns={CAMERA_ROLL_NUM_COLUMNS}
        contentContainerStyle={contentContainerStyle}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={listEmptyComponent}
        initialNumToRender={18}
        maxToRenderPerBatch={12}
        windowSize={7}
        removeClippedSubviews
      />
    </Modal>
  );
});

const styles = StyleSheet.create({
  emptyText: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
});
