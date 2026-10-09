import { LensCameraRoll } from '@features/Lens/LensCameraRoll';
import type { CameraRollMediaAsset } from '@features/Lens/Camera/cameraRollPhotos/CameraRollMediaAsset';
import { PREFETCH_COUNT } from '@features/Lens/Camera/cameraRollPhotos/constants';
import {
  resetCameraRollPhotosCache,
  setCameraRollPhotosCache,
} from '@features/Lens/Camera/cameraRollPhotos/cameraRollPhotosCache';
import { queryCameraRollMediaAssets } from '@features/Lens/Camera/cameraRollPhotos/queryCameraRollMediaAssets';
import { renderWithContext } from '@testing/renderWithContext';
import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

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

jest.mock('expo-router', () => {
  const actual = jest.requireActual<typeof import('expo-router')>('expo-router');
  return {
    ...actual,
    router: {
      ...actual.router,
      push: jest.fn(),
    },
  };
});

jest.mock('@features/Lens/ColorPalette/ColorPaletteImage', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    ColorPaletteImage: () => <View testID="color-palette-image" />,
  };
});

jest.mock('@features/Lens/Camera/cameraRollPhotos/queryCameraRollMediaAssets', () => ({
  queryCameraRollMediaAssets: jest.fn().mockResolvedValue({
    assets: [],
    hasMore: false,
  }),
}));

jest.mock('@features/Lens/Camera/cameraRollPhotos/prefetchCameraRollThumbnails', () => ({
  prefetchCameraRollThumbnails: jest.fn(() => Promise.resolve()),
}));

const createAsset = (id: string): CameraRollMediaAsset => ({
  id,
  uri: `file:///${id}.jpg`,
  mediaType: 'image',
  width: 100,
  height: 100,
  filename: `${id}.jpg`,
  creationTime: 0,
  modificationTime: 0,
  duration: 0,
});

describe('LensCameraRoll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
  });

  it('keeps FlashList mounted while loading with an empty cache', async () => {
    const mockedQuery = jest.mocked(queryCameraRollMediaAssets);
    mockedQuery.mockReturnValue(new Promise(() => {}));

    renderWithContext(<LensCameraRoll />);

    expect(await screen.findByTestId('lens-camera-roll-list')).toBeOnTheScreen();
    expect(await screen.findByText('Loading photos...')).toBeOnTheScreen();
  });

  it('shows an empty-state message when the catalog is empty', async () => {
    setCameraRollPhotosCache({
      photos: [],
      nextOffset: 0,
      hasMore: false,
      prefetchComplete: true,
    });

    renderWithContext(<LensCameraRoll />);

    expect(await screen.findByText('No photos in camera roll')).toBeOnTheScreen();
  });

  it('renders cached photos immediately without a load-more footer', async () => {
    setCameraRollPhotosCache({
      photos: [createAsset('cached-1'), createAsset('cached-2')],
      nextOffset: 2,
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
      nextOffset: PREFETCH_COUNT,
      hasMore: true,
      prefetchComplete: true,
    });

    const mockedQuery = jest.mocked(queryCameraRollMediaAssets);
    mockedQuery.mockResolvedValueOnce({
      assets: [createAsset('photo-301')],
      hasMore: false,
    });

    renderWithContext(<LensCameraRoll />);

    const list = await screen.findByTestId('lens-camera-roll-list');

    fireEvent(list, 'onEndReached');

    expect(await screen.findByTestId('lens-photo-grid-photo-301')).toBeOnTheScreen();
    expect(screen.queryByText('Loading more photos...')).not.toBeOnTheScreen();
  });
});
