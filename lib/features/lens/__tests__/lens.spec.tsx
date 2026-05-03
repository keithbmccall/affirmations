import './lens-full-native-mocks';

import Lens from '@features/lens/lens';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { StorageDevice } from '@storage/storage';
import { act, fireEvent, screen } from 'expo-router/testing-library';
import React from 'react';
import { Alert } from 'react-native';
import { lensMediaLibraryMockState, makeAsset } from './lens-media-library-mock-state';
import { lensStorageMockState } from './lens-storage-mock-state';
import { lensVisionCameraMockState } from './lens-vision-camera-mock-state';
import { resetCameraRollPhotosCache } from '@storage/cache';
import { lensGestureMockState } from './lens-gesture-mock-state';

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
  lensVisionCameraMockState.takePhoto.mockResolvedValue({ path: '/tmp/photo.jpg' });
  lensMediaLibraryMockState.createAssetAsync.mockResolvedValue(
    makeAsset({
      id: 'new-asset',
      uri: 'file:///new.jpg',
      path: '/tmp/photo.jpg',
    })
  );
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
  lensVisionCameraMockState.startRecording.mockReset();
  lensVisionCameraMockState.startRecording.mockImplementation(() => {});
  lensVisionCameraMockState.stopRecording.mockReset();
  lensVisionCameraMockState.stopRecording.mockResolvedValue(undefined);
}

describe('lens.tsx', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
    lensGestureMockState.tapOnEnd = null;
    lensStorageMockState.loadData.mockResolvedValue(false);
    lensStorageMockState.saveData.mockResolvedValue(undefined);
    setupDefaultVisionMocks();
    lensVisionCameraMockState.initFrameProcessorPlugin.mockReturnValue({
      call: jest.fn(() => ({
        primary: '#101010',
        secondary: '#202020',
        tertiary: '#303030',
        quaternary: '#404040',
        quinary: '#505050',
        senary: '#606060',
        background: '#707070',
        detail: '#808080',
      })),
    });
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('loads saved lens palettes from storage', async () => {
    const saved = {
      a1: {
        id: 'a1',
        uri: 'file:///saved.jpg',
        mediaType: 'photo',
        palette: paletteFixture,
      },
    };
    lensStorageMockState.loadData.mockImplementation(async key => {
      if (key === StorageDevice.LENS_PALETTES) return saved;
      return false;
    });

    renderWithContext(<Lens statusBarProps={{ style: 'auto' }} />);
    await flushProviderMicrotasks();

    expect(lensStorageMockState.loadData).toHaveBeenCalledWith(StorageDevice.LENS_PALETTES);
  });

  it('persists lens palettes after a color-lens capture adds to the map', async () => {
    renderWithContext(<Lens statusBarProps={{ style: 'auto' }} />);
    await flushProviderMicrotasks();

    fireEvent.press(screen.getByTestId('lens-toggle-color-lens'));
    await act(async () => {
      await flushProviderMicrotasks();
    });

    fireEvent.press(screen.getByTestId('lens-capture-button'));
    await act(async () => {
      await flushProviderMicrotasks();
    });

    expect(lensMediaLibraryMockState.createAssetAsync).toHaveBeenCalled();
    expect(lensStorageMockState.saveData).toHaveBeenCalledWith(
      StorageDevice.LENS_PALETTES,
      expect.objectContaining({
        'new-asset': expect.objectContaining({ id: 'new-asset' }),
      })
    );
  });
});
