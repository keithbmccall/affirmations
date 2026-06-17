import { CameraRollInspector } from '@features/Lens/CameraRollInspector';
import {
  resetCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from '@features/Lens/Camera/cameraRollPhotos/cameraRollPhotosCache';
import { useLensCameraRollPhotos } from '@features/Lens/Camera/hooks/useLensCameraRollPhotos';
import { renderWithContext } from '@testing/renderWithContext';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';
import type { Asset } from 'expo-media-library';

jest.mock('@components/Modal', () => {
  const { View, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Modal: ({ children, title }: { children: React.ReactNode; title: string }) => (
      <View>
        <Text>{title}</Text>
        {children}
      </View>
    ),
  };
});

jest.mock('@features/Lens/Camera/hooks/useLensCameraRollPhotos', () => ({
  useLensCameraRollPhotos: jest.fn(),
}));

jest.mock('@features/Lens/ColorPalette/ColorPaletteImageInspector', () => {
  const { View, Pressable, Text } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    ColorPaletteImageInspector: ({
      image,
      onOverlayOpenChange,
    }: {
      image: { id: string };
      onOverlayOpenChange?: (isOpen: boolean) => void;
    }) => (
      <View testID={`inspector-mock-${image.id}`}>
        <Text>{image.id}</Text>
        {onOverlayOpenChange ? (
          <>
            <Pressable
              testID={`open-overlay-${image.id}`}
              onPress={() => onOverlayOpenChange(true)}
            />
            <Pressable
              testID={`close-overlay-${image.id}`}
              onPress={() => onOverlayOpenChange(false)}
            />
          </>
        ) : null}
      </View>
    ),
  };
});

const mockedUseLensCameraRollPhotos = useLensCameraRollPhotos as jest.MockedFunction<
  typeof useLensCameraRollPhotos
>;

const createAsset = (id: string): Asset =>
  ({
    id,
    uri: `file:///${id}.jpg`,
    mediaType: 'photo',
    width: 100,
    height: 100,
    filename: `${id}.jpg`,
    creationTime: 0,
    modificationTime: 0,
    duration: 0,
  }) as Asset;

const toAssetParam = (asset: Asset) =>
  JSON.stringify({
    id: asset.id,
    uri: asset.uri,
    mediaType: asset.mediaType,
    width: asset.width,
    height: asset.height,
  });

describe('CameraRollInspector', () => {
  const mockLoadMore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
  });

  it('renders a horizontal pager with multiple photos when the asset is in the catalog', async () => {
    const photos = [createAsset('photo-1'), createAsset('photo-2'), createAsset('photo-3')];

    mockedUseLensCameraRollPhotos.mockReturnValue({
      photos,
      loading: false,
      error: null,
      loadMore: mockLoadMore,
    });

    renderWithContext(
      <CameraRollInspector asset={toAssetParam(photos[1])} />
    );

    const pager = await screen.findByTestId('camera-roll-inspector-pager');

    expect(pager.props.data).toHaveLength(3);
    expect(screen.getByTestId('camera-roll-inspector-page-photo-2')).toBeOnTheScreen();
    expect(pager.props.initialScrollIndex).toBe(1);
  });

  it('falls back to a single inspector when the asset is not in the catalog', async () => {
    const photos = [createAsset('photo-1'), createAsset('photo-2')];
    const missingAsset = createAsset('missing-photo');

    mockedUseLensCameraRollPhotos.mockReturnValue({
      photos,
      loading: false,
      error: null,
      loadMore: mockLoadMore,
    });

    renderWithContext(
      <CameraRollInspector asset={toAssetParam(missingAsset)} />
    );

    expect(await screen.findByTestId('inspector-mock-missing-photo')).toBeOnTheScreen();
    expect(screen.queryByTestId('camera-roll-inspector-pager')).not.toBeOnTheScreen();
  });

  it('calls loadMore when paging near the end of the loaded catalog', async () => {
    const photos = [createAsset('photo-1'), createAsset('photo-2'), createAsset('photo-3')];

    setCameraRollPhotosCache({
      photos,
      endCursor: 'cursor',
      hasMore: true,
      prefetchComplete: true,
    });

    mockedUseLensCameraRollPhotos.mockReturnValue({
      photos,
      loading: false,
      error: null,
      loadMore: mockLoadMore,
    });

    renderWithContext(
      <CameraRollInspector asset={toAssetParam(photos[0])} />
    );

    const pager = await screen.findByTestId('camera-roll-inspector-pager');

    fireEvent(pager, 'onViewableItemsChanged', {
      viewableItems: [
        {
          index: 2,
          item: photos[2],
          key: photos[2].id,
          isViewable: true,
        },
      ],
    });

    expect(mockLoadMore).toHaveBeenCalledTimes(1);
  });

  it('disables pager scrolling while the active overlay is open', async () => {
    const photos = [createAsset('photo-1'), createAsset('photo-2')];

    mockedUseLensCameraRollPhotos.mockReturnValue({
      photos,
      loading: false,
      error: null,
      loadMore: mockLoadMore,
    });

    renderWithContext(
      <CameraRollInspector asset={toAssetParam(photos[0])} />
    );

    const pager = await screen.findByTestId('camera-roll-inspector-pager');
    expect(pager.props.scrollEnabled).toBe(true);

    fireEvent.press(screen.getByTestId('open-overlay-photo-1'));

    expect(screen.getByTestId('camera-roll-inspector-pager').props.scrollEnabled).toBe(false);

    fireEvent.press(screen.getByTestId('close-overlay-photo-1'));

    expect(screen.getByTestId('camera-roll-inspector-pager').props.scrollEnabled).toBe(true);
  });

  it('re-enables pager scrolling when swiping to another page after overlay was open', async () => {
    const photos = [createAsset('photo-1'), createAsset('photo-2')];

    mockedUseLensCameraRollPhotos.mockReturnValue({
      photos,
      loading: false,
      error: null,
      loadMore: mockLoadMore,
    });

    renderWithContext(
      <CameraRollInspector asset={toAssetParam(photos[0])} />
    );

    const pager = await screen.findByTestId('camera-roll-inspector-pager');

    fireEvent.press(screen.getByTestId('open-overlay-photo-1'));
    expect(pager.props.scrollEnabled).toBe(false);

    fireEvent(pager, 'onViewableItemsChanged', {
      viewableItems: [
        {
          index: 1,
          item: photos[1],
          key: photos[1].id,
          isViewable: true,
        },
      ],
    });

    expect(screen.getByTestId('camera-roll-inspector-pager').props.scrollEnabled).toBe(true);
  });
});
