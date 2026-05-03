import './lens-full-native-mocks';

import { useLensPermissions } from '@features/lens/camera/hooks/use-lens-permissions';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { resetCameraRollPhotosCache } from '@storage/cache';
import { act } from 'expo-router/testing-library';
import React from 'react';
import { Alert } from 'react-native';
import { lensGestureMockState } from './lens-gesture-mock-state';
import { lensMediaLibraryMockState, makeAsset } from './lens-media-library-mock-state';
import { lensStorageMockState } from './lens-storage-mock-state';
import { lensVisionCameraMockState } from './lens-vision-camera-mock-state';

function PermissionsHarness() {
  useLensPermissions();
  return null;
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

describe('use-lens-permissions.ts', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    resetCameraRollPhotosCache();
    lensGestureMockState.tapOnEnd = null;
    lensStorageMockState.loadData.mockResolvedValue(false);
    lensStorageMockState.saveData.mockResolvedValue(undefined);
    setupDefaultVisionMocks();
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('alerts when permission requests throw', async () => {
    lensVisionCameraMockState.useCameraPermission.mockReturnValue({
      hasPermission: false,
      requestPermission: jest.fn(async () => {
        throw new Error('denied');
      }),
    });
    renderWithContext(<PermissionsHarness />);
    await act(async () => {
      await flushProviderMicrotasks();
    });
    expect(alertSpy).toHaveBeenCalledWith(
      'Permissions Required',
      'Camera and microphone and media library permissions are required to use this feature.',
      [{ text: 'OK' }]
    );
  });
});
