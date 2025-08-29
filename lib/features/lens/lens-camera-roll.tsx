import { Modal } from '@components/modal';
import { ThemedText } from '@components/shared';
import { ColorPaletteImage, InspectionAsset, LensPalette } from '@features/lens/lens-palette';
import { useLens } from '@platform';
import { Routes } from '@routes';
import { getCameraRollPhotosCache, setCameraRollPhotosCache } from '@storage';
import { spacing, useThemeColor } from '@styles';
import { ScreenContainerProps } from '@types';
import { Asset, getAssetsAsync } from 'expo-media-library';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

const defaultPhotos = getCameraRollPhotosCache() || [];

interface LensCameraRollProps extends ScreenContainerProps {}

export const LensCameraRoll = ({}: LensCameraRollProps) => {
  const { lensPalettesMap } = useLens();
  const borderColor = useThemeColor({}, 'background');
  const [photos, setPhotos] = useState<Asset[]>(defaultPhotos);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  const contentContainerStyle = useMemo(() => ({ borderColor }), []);

  const fetchPhotos = useCallback(
    async (isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const cachedPhotos = getCameraRollPhotosCache();
        const cachedPhotosLength = cachedPhotos?.length || 30;

        const result = await getAssetsAsync({
          first: cachedPhotosLength,
          mediaType: ['photo'],
          sortBy: ['creationTime'],
          after: isInitial ? undefined : endCursor || undefined,
        });
        setCameraRollPhotosCache(result.assets);

        if (isInitial) {
          setPhotos(result.assets);
        } else {
          setPhotos(prev => [...prev, ...result.assets]);
        }

        setEndCursor(result.endCursor);
        setHasMore(result.hasNextPage);
      } catch (err) {
        console.error('Error fetching photos:', err);
        setError('Failed to load photos from camera roll');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [endCursor]
  );

  useEffect(() => {
    fetchPhotos(true);
  }, []);

  const loadMorePhotos = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPhotos(false);
    }
  }, [loadingMore, hasMore, fetchPhotos]);

  const renderPhoto = useCallback(({ item }: { item: Asset }) => {
    const lensPalette: LensPalette | undefined = lensPalettesMap[item.id];

    return (
      <Pressable onPress={() => handlePhotoPress(item, lensPalette)}>
        <ColorPaletteImage image={item} lensPalette={lensPalette} />
      </Pressable>
    );
  }, []);

  const keyExtractor = useCallback((item: Asset) => item.id, []);

  return (
    <Modal title="Camera Roll" testID="lens-camera-roll-title">
      {loading ? (
        <ThemedText type="default" style={styles.description}>
          Loading photos...
        </ThemedText>
      ) : error ? (
        <ThemedText type="default" style={styles.description}>
          {error}
        </ThemedText>
      ) : (
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={keyExtractor}
          numColumns={3}
          contentContainerStyle={contentContainerStyle}
          onEndReached={loadMorePhotos}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loadingMore ? (
              <ThemedText type="default" style={styles.loadingText}>
                Loading more photos...
              </ThemedText>
            ) : null
          }
        />
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  description: {
    marginBottom: spacing.xl,
  },
  loadingText: {
    padding: spacing.lg,
  },
});
