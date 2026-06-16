import { Modal } from '@components/Modal';
import { ColorPaletteImageInspector } from '@features/Lens/ColorPalette/ColorPaletteImageInspector';
import type { InspectionAsset, LensPalette } from '@features/Lens/ColorPalette/types';
import { getCameraRollPhotosCache } from '@features/Lens/Camera/cameraRollPhotos/cameraRollPhotosCache';
import { toInspectionAsset } from '@features/Lens/Camera/cameraRollPhotos/toInspectionAsset';
import { useLensCameraRollPhotos } from '@features/Lens/Camera/hooks/useLensCameraRollPhotos';
import { useLens } from '@platform';
import type { ScreenContainerProps } from '@shared-types/ScreenContainerProps';
import type { Asset } from 'expo-media-library';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type LayoutChangeEvent,
  type ListRenderItem,
  type ViewToken,
  StyleSheet,
  View,
} from 'react-native';

const LOAD_MORE_THRESHOLD_FROM_END = 3;
const windowWidth = Dimensions.get('window').width;

interface CameraRollInspectorProps extends ScreenContainerProps {
  asset: string;
}

interface InspectorPagerItemProps {
  asset: Asset;
  lensPalette: LensPalette | undefined;
  isActive: boolean;
  pageWidth: number;
  onOverlayOpenChange: (isOpen: boolean) => void;
}

const InspectorPagerItem = memo(function InspectorPagerItem({
  asset,
  lensPalette,
  isActive,
  pageWidth,
  onOverlayOpenChange,
}: InspectorPagerItemProps) {
  const inspectionAsset = useMemo(
    () => toInspectionAsset(asset, lensPalette),
    [asset, lensPalette]
  );

  const handleOverlayOpenChange = useCallback(
    (isOpen: boolean) => {
      if (isActive) {
        onOverlayOpenChange(isOpen);
      }
    },
    [isActive, onOverlayOpenChange]
  );

  const pageStyle = useMemo(() => ({ width: pageWidth, flex: 1 }), [pageWidth]);

  return (
    <View style={pageStyle} testID={`camera-roll-inspector-page-${asset.id}`}>
      <ColorPaletteImageInspector
        image={inspectionAsset}
        onOverlayOpenChange={handleOverlayOpenChange}
      />
    </View>
  );
});

export const CameraRollInspector = memo(function CameraRollInspector({
  asset,
}: CameraRollInspectorProps) {
  const parsedAsset: InspectionAsset = useMemo(() => {
    return JSON.parse(asset) as InspectionAsset;
  }, [asset]);

  const { photos, loadMore } = useLensCameraRollPhotos();
  const { lensPalettesMap } = useLens();
  const loadMoreRef = useRef(loadMore);
  loadMoreRef.current = loadMore;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPagerScrollEnabled, setIsPagerScrollEnabled] = useState(true);
  const [pageWidth, setPageWidth] = useState(windowWidth);

  const initialIndex = useMemo(() => {
    const index = photos.findIndex(photo => photo.id === parsedAsset.id);
    return index === -1 ? 0 : index;
  }, [parsedAsset.id, photos]);

  const isPagerMode = photos.length > 0 && photos.some(photo => photo.id === parsedAsset.id);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setIsPagerScrollEnabled(true);
  }, [currentIndex]);

  const handleOverlayOpenChange = useCallback((isOpen: boolean) => {
    setIsPagerScrollEnabled(!isOpen);
  }, []);

  const handlePageLayout = useCallback((event: LayoutChangeEvent) => {
    const measuredWidth = event.nativeEvent.layout.width;

    if (measuredWidth > 0 && measuredWidth !== pageWidth) {
      setPageWidth(measuredWidth);
    }
  }, [pageWidth]);

  const getItemLayout = useCallback(
    (_data: ArrayLike<Asset> | null | undefined, index: number) => ({
      length: pageWidth,
      offset: pageWidth * index,
      index,
    }),
    [pageWidth]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<Asset>[] }) => {
      const firstVisible = viewableItems[0];

      if (firstVisible?.index === null || firstVisible?.index === undefined) {
        return;
      }

      const nextIndex = firstVisible.index;
      setCurrentIndex(nextIndex);

      const snapshot = getCameraRollPhotosCache();

      if (
        snapshot.hasMore &&
        nextIndex >= snapshot.photos.length - LOAD_MORE_THRESHOLD_FROM_END
      ) {
        loadMoreRef.current();
      }
    }
  ).current;

  const keyExtractor = useCallback((item: Asset) => item.id, []);

  const renderItem: ListRenderItem<Asset> = useCallback(
    ({ item, index }) => (
      <InspectorPagerItem
        asset={item}
        lensPalette={lensPalettesMap[item.id]}
        isActive={index === currentIndex}
        pageWidth={pageWidth}
        onOverlayOpenChange={handleOverlayOpenChange}
      />
    ),
    [currentIndex, handleOverlayOpenChange, lensPalettesMap, pageWidth]
  );

  const pagerExtraData = useMemo(() => currentIndex, [currentIndex]);

  if (!isPagerMode) {
    return (
      <Modal title="Camera Roll Inspector" testID="camera-roll-inspector-title" enableBackButton>
        <ColorPaletteImageInspector image={parsedAsset} />
      </Modal>
    );
  }

  return (
    <Modal title="Camera Roll Inspector" testID="camera-roll-inspector-title" enableBackButton>
      <View style={styles.pagerContainer} onLayout={handlePageLayout}>
        <FlatList
          testID="camera-roll-inspector-pager"
          data={photos}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={isPagerScrollEnabled}
          initialScrollIndex={initialIndex}
          getItemLayout={getItemLayout}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          extraData={pagerExtraData}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          windowSize={3}
        />
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  pagerContainer: {
    flex: 1,
  },
});
