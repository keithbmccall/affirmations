import { LensCameraRoll } from '@features/Lens/LensCameraRoll';
import { PREFETCH_COUNT } from '@features/Lens/Camera/cameraRollPhotos/constants';
import { resetCameraRollPhotosCache, setCameraRollPhotosCache } from '@storage/cache';
import { renderWithContext } from '@testing/renderWithContext';
import { fireEvent, screen } from '@testing-library/react-native';

jest.mock('@components/Modal', () => ({
  Modal: ({ children, title }: { children: React.ReactNode; title: string }) => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text>{title}</Text>
        {children}
      </View>
    );
  },
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@features/Lens/ColorPalette/ColorPaletteImage', () => ({
  ColorPaletteImage: () => {
    const { View } = require('react-native');
    return <View testID="color-palette-image" />;
  },
}));

jest.mock('expo-media-library', () => ({
  getAssetsAsync: jest.fn().mockResolvedValue({
    assets: [],
    endCursor: null,
    hasNextPage: false,
    totalCount: 0,
  }),
}));

import { type Asset } from 'expo-media-library';

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

describe('LensCameraRoll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
  });

  it('keeps FlatList mounted while loading with an empty cache', async () => {
    const { getAssetsAsync } = require('expo-media-library');
    getAssetsAsync.mockReturnValue(new Promise(() => {}));

    renderWithContext(<LensCameraRoll />);

    expect(await screen.findByTestId('lens-camera-roll-list')).toBeOnTheScreen();
    expect(await screen.findByText('Loading photos...')).toBeOnTheScreen();
  });

  it('shows an empty-state message when the catalog is empty', async () => {
    setCameraRollPhotosCache({
      photos: [],
      endCursor: null,
      hasMore: false,
      prefetchComplete: true,
    });

    renderWithContext(<LensCameraRoll />);

    expect(await screen.findByText('No photos in camera roll')).toBeOnTheScreen();
  });

  it('renders cached photos immediately without a load-more footer', async () => {
    setCameraRollPhotosCache({
      photos: [createAsset('cached-1'), createAsset('cached-2')],
      endCursor: null,
      hasMore: false,
      prefetchComplete: true,
    });

    renderWithContext(<LensCameraRoll />);

    expect(await screen.findByTestId('lens-camera-roll-list')).toBeOnTheScreen();
    expect(screen.queryByText('Loading more photos...')).not.toBeOnTheScreen();
    expect(screen.queryByText('Loading photos...')).not.toBeOnTheScreen();
  });

  it('grows the photo list silently when end reached beyond prefetch', async () => {
    const prefetchedAssets = Array.from({ length: PREFETCH_COUNT }, (_, index) =>
      createAsset(`photo-${index}`)
    );

    setCameraRollPhotosCache({
      photos: prefetchedAssets,
      endCursor: 'cursor-300',
      hasMore: true,
      prefetchComplete: true,
    });

    const { getAssetsAsync } = require('expo-media-library');
    getAssetsAsync.mockResolvedValueOnce({
      assets: [createAsset('photo-301')],
      endCursor: null,
      hasNextPage: false,
      totalCount: PREFETCH_COUNT + 1,
    });

    renderWithContext(<LensCameraRoll />);

    const list = await screen.findByTestId('lens-camera-roll-list');

    fireEvent(list, 'onEndReached');

    expect(await screen.findByTestId('lens-photo-grid-photo-301')).toBeOnTheScreen();
    expect(screen.queryByText('Loading more photos...')).not.toBeOnTheScreen();
  });
});
