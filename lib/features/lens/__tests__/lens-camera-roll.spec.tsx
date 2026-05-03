import './lens-full-native-mocks';

import { LensCameraRoll } from '@features/lens/lens-camera-roll';
import { useLens } from '@platform';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { resetCameraRollPhotosCache } from '@storage/cache';
import { act, fireEvent, screen } from 'expo-router/testing-library';
import { waitFor } from '@testing-library/react-native';
import * as ExpoRouter from 'expo-router';
import React from 'react';
import { lensMediaLibraryMockState, makeAsset } from './lens-media-library-mock-state';
import { lensStorageMockState } from './lens-storage-mock-state';
import { lensGestureMockState } from './lens-gesture-mock-state';
import { lensVisionCameraMockState } from './lens-vision-camera-mock-state';

const paletteFixture = {
  primaryColor: '#010101',
  secondaryColor: '#020202',
  tertiaryColor: '#030303',
  quaternaryColor: '#040404',
  quinaryColor: '#050505',
  senaryColor: '#060606',
  backgroundColor: '#070707',
  detailColor: '#080808',
};

function LensCameraRollWithPaletteInStore() {
  const { onSetLensPalettesMap } = useLens();
  React.useEffect(() => {
    onSetLensPalettesMap({
      p1: {
        id: 'p1',
        uri: 'file:///p1.jpg',
        mediaType: 'photo',
        palette: paletteFixture,
      },
    });
  }, [onSetLensPalettesMap]);
  return <LensCameraRoll />;
}

function setupDefaultVisionMocks() {
  lensVisionCameraMockState.useCameraDevice.mockImplementation(() => ({ id: 'mock-device' }));
  lensVisionCameraMockState.useCameraPermission.mockImplementation(() => ({
    hasPermission: true,
    requestPermission: jest.fn(async () => {}),
  }));
  lensVisionCameraMockState.useMicrophonePermission.mockImplementation(() => ({
    hasPermission: true,
    requestPermission: jest.fn(async () => {}),
  }));
  lensMediaLibraryMockState.mediaLibraryGranted = true;
  lensMediaLibraryMockState.getAssetsAsync.mockImplementation(async options => {
    const first = (options as { first?: number }).first ?? 20;
    const assets = [makeAsset({ id: 'roll-1', uri: 'file:///roll1.jpg' })].slice(0, first);
    return {
      assets,
      endCursor: 'cursor-1',
      hasNextPage: false,
      totalCount: assets.length,
    };
  });
}

describe('lens-camera-roll.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
    lensGestureMockState.tapOnEnd = null;
    lensStorageMockState.loadData.mockResolvedValue(false);
    lensStorageMockState.saveData.mockResolvedValue(undefined);
    setupDefaultVisionMocks();
  });

  it('shows grid, supports pagination footer, and navigates on photo press', async () => {
    const push = jest.spyOn(ExpoRouter.router, 'push').mockImplementation(() => {});
    lensMediaLibraryMockState.getAssetsAsync.mockReset();
    lensMediaLibraryMockState.getAssetsAsync.mockImplementation(async options => {
      const after = (options as { after?: string | null }).after;
      if (!after) {
        return {
          assets: [makeAsset({ id: 'p1' })],
          endCursor: 'c1',
          hasNextPage: true,
          totalCount: 1,
        };
      }
      return {
        assets: [makeAsset({ id: 'p2', uri: 'file:///p2.jpg' })],
        endCursor: 'c2',
        hasNextPage: false,
        totalCount: 2,
      };
    });

    renderWithContext(<LensCameraRoll />);
    expect(await screen.findByTestId('lens-camera-roll-title')).toBeOnTheScreen();
    await flushProviderMicrotasks();
    expect(await screen.findByTestId('lens-camera-roll-list')).toBeOnTheScreen();
    await waitFor(() => {
      expect(screen.queryByText('Loading photos...')).toBeNull();
    });

    const list = screen.getByTestId('lens-camera-roll-list');
    await act(async () => {
      fireEvent(list, 'onEndReached');
      await flushProviderMicrotasks();
    });
    expect(lensMediaLibraryMockState.getAssetsAsync).toHaveBeenCalledWith(
      expect.objectContaining({ after: 'c1', first: expect.any(Number) })
    );
    await act(async () => {
      await flushProviderMicrotasks();
    });

    fireEvent.press(screen.getByTestId('lens-photo-grid-p1'));
    expect(push).toHaveBeenCalled();
    push.mockRestore();
  });

  it('renders palette strip on thumbnails when store has a palette for the asset', async () => {
    lensMediaLibraryMockState.getAssetsAsync.mockResolvedValue({
      assets: [makeAsset({ id: 'p1', uri: 'file:///p1.jpg' })],
      endCursor: null,
      hasNextPage: false,
      totalCount: 1,
    });
    renderWithContext(<LensCameraRollWithPaletteInStore />);
    await act(async () => {
      await flushProviderMicrotasks();
    });
    expect(await screen.findByTestId('lens-photo-grid-p1')).toBeOnTheScreen();
  });

  it('shows error when getAssetsAsync fails', async () => {
    lensMediaLibraryMockState.getAssetsAsync.mockRejectedValueOnce(new Error('network'));
    renderWithContext(<LensCameraRoll />);
    expect(await screen.findByText('Failed to load photos from camera roll')).toBeOnTheScreen();
  });

  it('ignores pagination when no additional pages exist', async () => {
    lensMediaLibraryMockState.getAssetsAsync.mockResolvedValue({
      assets: [makeAsset({ id: 'only' })],
      endCursor: null,
      hasNextPage: false,
      totalCount: 1,
    });
    renderWithContext(<LensCameraRoll />);
    const list = await screen.findByTestId('lens-camera-roll-list');
    await act(async () => {
      fireEvent(list, 'onEndReached');
      await flushProviderMicrotasks();
    });
    expect(lensMediaLibraryMockState.getAssetsAsync).toHaveBeenCalledTimes(1);
  });
});
