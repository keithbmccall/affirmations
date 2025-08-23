import { Modal } from '@components/modal';
import { ThemedText } from '@components/shared';
import { globalStyles, spacing, useThemeColor } from '@styles';
import { getAssetsAsync } from 'expo-media-library';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet } from 'react-native';
import { ScreenContainerProps } from './types';

const { width } = Dimensions.get('window');

interface LensCameraRollProps extends ScreenContainerProps {}

export const LensCameraRoll = ({}: LensCameraRollProps) => {
  const borderColor = useThemeColor({}, 'background');
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  const fetchPhotos = useCallback(
    async (isInitial = false) => {
      try {
        if (isInitial) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const result = await getAssetsAsync({
          first: 30,
          mediaType: ['photo'],
          sortBy: ['creationTime'],
          after: isInitial ? undefined : endCursor || undefined,
        });

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
  }, [fetchPhotos]);

  const loadMorePhotos = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPhotos(false);
    }
  }, [loadingMore, hasMore, fetchPhotos]);

  const renderPhoto = useCallback(
    ({ item }: { item: any }) => (
      <Image source={{ uri: item.uri }} style={styles.photoItem} resizeMode="cover" />
    ),
    []
  );

  const keyExtractor = useCallback((item: any) => item.id, []);

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
          columnWrapperStyle={[styles.photoRow, { borderColor }]}
          contentContainerStyle={[styles.photoList, { borderColor }]}
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
  closeButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  photoList: {
    ...globalStyles.flex1,
  },
  photoRow: {
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  photoItem: {
    width: (width - 2) / 3, // Subtract 2 for the border width
    height: (width - 2) / 3, // Subtract 2 for the border width
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  loadingText: {
    padding: spacing.lg,
  },
});
