import './lens-full-native-mocks';

import { applySkiaLensToPhotoFile } from '@features/lens/camera/applySkiaLensToPhotoFile';
import { SKIA_COLOR_MODE } from '@features/lens/camera/camera-options';
import { Camera } from '@features/lens/camera/components/camera';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { resetCameraRollPhotosCache } from '@storage/cache';
import { Routes } from '@routes/routes';
import { act, fireEvent, screen } from 'expo-router/testing-library';
import * as ExpoRouter from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import { lensGestureMockState } from './lens-gesture-mock-state';
import { lensMediaLibraryMockState, makeAsset } from './lens-media-library-mock-state';
import { lensStorageMockState } from './lens-storage-mock-state';
import { lensVisionCameraMockState } from './lens-vision-camera-mock-state';

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

describe('camera.tsx', () => {
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

  it('shows no camera when device is unavailable', async () => {
    lensVisionCameraMockState.useCameraDevice.mockReturnValue(undefined);
    renderWithContext(<Camera />);
    expect(await screen.findByText('No camera available')).toBeOnTheScreen();
  });

  it('shows permission message when a permission is missing', async () => {
    lensVisionCameraMockState.useCameraPermission.mockReturnValue({
      hasPermission: false,
      requestPermission: jest.fn(async () => {}),
    });
    renderWithContext(<Camera />);
    expect(await screen.findByText('Camera permission required')).toBeOnTheScreen();
  });

  it('invokes router.back from the back control', async () => {
    const back = jest.spyOn(ExpoRouter.router, 'back').mockImplementation(() => {});
    renderWithContext(<Camera />);
    fireEvent.press(screen.getByTestId('lens-back-button'));
    expect(back).toHaveBeenCalled();
    back.mockRestore();
  });

  it('toggles grid, flash, camera position, lens configuration, and shows palette when color lens is on', async () => {
    renderWithContext(<Camera />);
    fireEvent.press(screen.getByTestId('lens-control-grid'));
    fireEvent.press(screen.getByTestId('lens-control-grid'));
    fireEvent.press(screen.getByTestId('lens-control-flash'));
    fireEvent.press(screen.getByTestId('lens-control-flash'));
    fireEvent.press(screen.getByTestId('lens-control-flip-camera'));
    fireEvent.press(screen.getByTestId('lens-control-lens-device'));
    fireEvent.press(screen.getByTestId('lens-toggle-color-lens'));

    await act(async () => {
      await flushProviderMicrotasks();
    });
  });

  it('runs focus tap from gesture and calls camera.focus', async () => {
    renderWithContext(<Camera />);
    expect(lensGestureMockState.tapOnEnd).toBeTruthy();
    await act(async () => {
      lensGestureMockState.tapOnEnd!({ x: 120, y: 240 });
    });
    expect(lensVisionCameraMockState.focus).toHaveBeenCalledWith({ x: 120, y: 240 });
  });

  it('runs frame processor branches', async () => {
    renderWithContext(<Camera />);
    const processor = lensVisionCameraMockState.lastFrameProcessor;
    expect(processor).toBeTruthy();
    await act(async () => {
      processor!({} as never);
    });
    fireEvent.press(screen.getByTestId('lens-toggle-color-lens'));
    await act(async () => {
      processor!({} as never);
    });
  });

  it('alerts on takePhoto failure', async () => {
    lensVisionCameraMockState.takePhoto.mockRejectedValueOnce(new Error('fail'));
    renderWithContext(<Camera />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('lens-capture-button'));
    });
    expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to capture');
  });

  it('records video when color lens is off and surfaces recording errors', async () => {
    renderWithContext(<Camera />);
    const capture = screen.getByTestId('lens-capture-button');

    lensVisionCameraMockState.startRecording.mockImplementation(
      ({ onRecordingError }: { onRecordingError: (e: { message: string }) => void }) => {
        onRecordingError({ message: 'mic fail' });
      }
    );

    await act(async () => {
      fireEvent(capture, 'longPress');
    });
    expect(alertSpy).toHaveBeenCalledWith('Recording error', 'mic fail');

    lensVisionCameraMockState.startRecording.mockImplementation(
      ({ onRecordingFinished }: { onRecordingFinished: (v: { path: string }) => void }) => {
        onRecordingFinished({ path: '/tmp/vid.mp4' });
      }
    );
    await act(async () => {
      fireEvent(capture, 'longPress');
    });
    await act(async () => {
      await flushProviderMicrotasks();
    });

    await act(async () => {
      fireEvent.press(capture);
    });
    expect(lensVisionCameraMockState.stopRecording).toHaveBeenCalled();
  });

  it('alerts when startRecording throws', async () => {
    lensVisionCameraMockState.startRecording.mockImplementation(() => {
      throw new Error('boom');
    });
    renderWithContext(<Camera />);
    const capture = screen.getByTestId('lens-capture-button');
    await act(async () => {
      fireEvent(capture, 'longPress');
    });
    expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to record video');
  });

  it('does not assign long-press video when color lens is enabled', async () => {
    renderWithContext(<Camera />);
    fireEvent.press(screen.getByTestId('lens-toggle-color-lens'));
    const capture = screen.getByTestId('lens-capture-button');
    await act(async () => {
      fireEvent(capture, 'longPress');
    });
    expect(lensVisionCameraMockState.startRecording).not.toHaveBeenCalled();
  });

  it('logs when recent media fetch fails', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    lensMediaLibraryMockState.getAssetsAsync.mockImplementation(async opts => {
      if ((opts as { first?: number }).first === 1) {
        throw new Error('roll fail');
      }
      return { assets: [], endCursor: null, hasNextPage: false, totalCount: 0 };
    });
    renderWithContext(<Camera />);
    await act(async () => {
      await flushProviderMicrotasks();
    });
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
    setupDefaultVisionMocks();
  });

  it('opens camera roll modal route from preview strip', async () => {
    const push = jest.spyOn(ExpoRouter.router, 'push').mockImplementation(() => {});
    renderWithContext(<Camera />);
    await act(async () => {
      await flushProviderMicrotasks();
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('lens-camera-roll-open'));
    });
    expect(push).toHaveBeenCalled();
    expect(push.mock.calls[0][0]).toBe(Routes.modals.lensCameraRoll.routePathname);
    push.mockRestore();
  });

  it('alerts when router.push throws from camera roll button', async () => {
    jest.spyOn(ExpoRouter.router, 'push').mockImplementation(() => {
      throw new Error('nav');
    });
    renderWithContext(<Camera />);
    await act(async () => {
      await flushProviderMicrotasks();
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('lens-camera-roll-open'));
    });
    expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to open camera roll');
    jest.mocked(ExpoRouter.router.push).mockRestore();
  });

  it('in Skia view mode saves only the filtered photo to the library', async () => {
    renderWithContext(<Camera />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('lens-control-view-mode'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('lens-capture-button'));
      await flushProviderMicrotasks();
    });
    expect(applySkiaLensToPhotoFile).toHaveBeenCalledWith({
      inputPath: '/tmp/photo.jpg',
      colorMode: SKIA_COLOR_MODE.DEFAULT,
    });
    expect(lensMediaLibraryMockState.createAssetAsync).toHaveBeenCalledTimes(1);
    expect(lensMediaLibraryMockState.createAssetAsync).toHaveBeenCalledWith('file:///cache/lens-skia-filtered.jpg');
  });
});
