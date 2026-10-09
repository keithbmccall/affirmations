import { COLOR_LENS_MODE } from '@features/Lens/ColorPalette/colorLensMode';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { createCameraRollMediaAsset } from '@features/Lens/Camera/cameraRollPhotos/createCameraRollMediaAsset';
import React, { createRef } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type {
  CameraPhotoOutput,
  CameraRef,
  CameraVideoOutput,
  Recorder,
} from 'react-native-vision-camera';

import {
  CameraSurfaceContextForTesting,
  type CameraSurfaceContextValue,
} from './CameraSurfaceContext';
import { CameraBottomControls } from './CameraBottomControls';
import { CAMERA_VIEW_MODE } from './options';

const mockFetchRecentMedia = jest.fn(() => Promise.resolve());
const mockHandleCameraRollPress = jest.fn();
const mockHandleCameraRollLongPress = jest.fn();
const mockRequestCameraRollHeadRefresh = jest.fn();

const mockUseCameraRollImpl = jest.fn(() => ({
  animatedPhotoStyle: {},
  handleCameraRollPress: mockHandleCameraRollPress,
  handleCameraRollLongPress: mockHandleCameraRollLongPress,
  fetchRecentMedia: mockFetchRecentMedia,
  recentMedia: null as string | null,
}));

jest.mock('@features/Lens/Camera/hooks/useCameraRoll', () => ({
  useCameraRoll: () => mockUseCameraRollImpl(),
}));

jest.mock('@features/Lens/Camera/cameraRollPhotos/refreshCameraRollHead', () => ({
  requestCameraRollHeadRefresh: () => mockRequestCameraRollHeadRefresh(),
}));

jest.mock('@features/Lens/Camera/cameraRollPhotos/createCameraRollMediaAsset', () => ({
  createCameraRollMediaAsset: jest.fn(() =>
    Promise.resolve({
      id: 'asset-1',
      uri: 'file:///asset',
      mediaType: 'image',
      width: 100,
      height: 100,
      filename: 'asset.jpg',
      creationTime: 0,
      modificationTime: 0,
      duration: 0,
    })
  ),
}));

jest.mock('expo-image', () => ({
  Image: () => {
    const RN = jest.requireActual('react-native');
    return <RN.View testID="expo-image" />;
  },
}));

const mockCapturePhotoToFile = jest.fn(() =>
  Promise.resolve({ filePath: '/tmp/photo.jpg' })
);
const mockCreateRecorder = jest.fn();
const mockStartRecording = jest.fn();
const mockStopRecording = jest.fn(() => Promise.resolve());

let pendingRecordingFinished: ((filePath: string) => void) | undefined;

jest.mock('react-native-vision-camera', () => {
  const RN = jest.requireActual('react-native');
  return {
    Camera: RN.View,
  };
});

const mockedCreateCameraRollMediaAsset = createCameraRollMediaAsset as jest.MockedFunction<
  typeof createCameraRollMediaAsset
>;

const mockPhotoOutput = {
  capturePhotoToFile: (...args: unknown[]) => mockCapturePhotoToFile(...args),
} as unknown as CameraPhotoOutput;

const mockVideoOutput = {
  createRecorder: (...args: unknown[]) => mockCreateRecorder(...args),
} as unknown as CameraVideoOutput;

function TestSafeArea({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      {children}
    </SafeAreaProvider>
  );
}

const createMockSurfaceContext = (
  overrides: Partial<CameraSurfaceContextValue> = {}
): CameraSurfaceContextValue => ({
  cameraRef: createRef<CameraRef | null>(),
  photoOutput: mockPhotoOutput,
  videoOutput: mockVideoOutput,
  showPreview: true,
  isActive: true,
  flashMode: 0,
  gridMode: 0,
  cameraViewMode: CAMERA_VIEW_MODE.LENS,
  device: undefined,
  onViewModeToggle: jest.fn(),
  onGridToggle: jest.fn(),
  onFlashToggle: jest.fn(),
  onSwitchCameraToggle: jest.fn(),
  onCameraDeviceToggle: jest.fn(),
  ...overrides,
});

const renderBottomControls = (
  props: Partial<React.ComponentProps<typeof CameraBottomControls>> = {},
  contextOverrides: Partial<CameraSurfaceContextValue> = {}
) => {
  const result = render(
    <TestSafeArea>
      <CameraSurfaceContextForTesting.Provider
        value={createMockSurfaceContext(contextOverrides)}
      >
        <CameraBottomControls {...props} />
      </CameraSurfaceContextForTesting.Provider>
    </TestSafeArea>
  );
  return result;
};

describe('CameraBottomControls', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.clearAllMocks();
    mockUseCameraRollImpl.mockImplementation(() => ({
      animatedPhotoStyle: {},
      handleCameraRollPress: mockHandleCameraRollPress,
      handleCameraRollLongPress: mockHandleCameraRollLongPress,
      fetchRecentMedia: mockFetchRecentMedia,
      recentMedia: null,
    }));
    mockedCreateCameraRollMediaAsset.mockResolvedValue({
      id: 'asset-1',
      uri: 'file:///asset',
      mediaType: 'image',
      width: 100,
      height: 100,
      filename: 'asset.jpg',
      creationTime: 0,
      modificationTime: 0,
      duration: 0,
    } as never);
    pendingRecordingFinished = undefined;
    mockStartRecording.mockImplementation((onRecordingFinished: (filePath: string) => void) => {
      pendingRecordingFinished = onRecordingFinished;
      return Promise.resolve();
    });
    mockStopRecording.mockImplementation(() => {
      pendingRecordingFinished?.('/tmp/video.mp4');
      return Promise.resolve();
    });
    mockCreateRecorder.mockImplementation(() =>
      Promise.resolve({
        startRecording: mockStartRecording,
        stopRecording: mockStopRecording,
      } as unknown as Recorder)
    );
    mockCapturePhotoToFile.mockResolvedValue({ filePath: '/tmp/photo.jpg' });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('fetches recent media on mount', async () => {
    renderBottomControls();

    await waitFor(() => {
      expect(mockFetchRecentMedia).toHaveBeenCalled();
    });
  });

  it('calls onPhotoCaptureStart before capturePhotoToFile when capturing a photo', async () => {
    const callOrder: string[] = [];
    const onPhotoCaptureStart = jest.fn(() => {
      callOrder.push('onPhotoCaptureStart');
      return {
        type: COLOR_LENS_MODE.LENS_DOMINANT,
        paletteSnapshot: {
          primaryColor: '#111111',
          secondaryColor: '#222222',
          tertiaryColor: '#333333',
          quaternaryColor: '#444444',
          quinaryColor: '#555555',
          senaryColor: '#666666',
          backgroundColor: '#777777',
          detailColor: '#888888',
        },
      } as const;
    });
    mockCapturePhotoToFile.mockImplementation(async () => {
      callOrder.push('capturePhotoToFile');
      return { filePath: '/tmp/photo.jpg' };
    });

    const { getByTestId } = renderBottomControls({ onPhotoCaptureStart });

    fireEvent.press(getByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(callOrder).toEqual(['onPhotoCaptureStart', 'capturePhotoToFile']);
    });
  });

  it('saves photo and refreshes camera roll head after capture', async () => {
    const onPhotoAssetSaved = jest.fn(() => Promise.resolve());
    const { getByTestId } = renderBottomControls({ onPhotoAssetSaved });

    fireEvent.press(getByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(mockedCreateCameraRollMediaAsset).toHaveBeenCalledWith('/tmp/photo.jpg');
      expect(onPhotoAssetSaved).toHaveBeenCalled();
      expect(mockFetchRecentMedia).toHaveBeenCalled();
      expect(mockRequestCameraRollHeadRefresh).toHaveBeenCalled();
    });
  });

  it('runs processPhotoPath before createCameraRollMediaAsset', async () => {
    const processPhotoPath = jest.fn(() => Promise.resolve('file:///painted.jpg'));
    const { getByTestId } = renderBottomControls({ processPhotoPath });

    fireEvent.press(getByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(processPhotoPath).toHaveBeenCalledWith('/tmp/photo.jpg');
      expect(mockedCreateCameraRollMediaAsset).toHaveBeenCalledWith('file:///painted.jpg');
    });
  });

  it('starts and stops video recording when video long press is enabled', async () => {
    const { getByTestId } = renderBottomControls({ enableVideoLongPress: true });

    fireEvent(getByTestId('lens-capture-button'), 'longPress');

    await waitFor(() => {
      expect(mockCreateRecorder).toHaveBeenCalled();
      expect(mockStartRecording).toHaveBeenCalled();
    });

    fireEvent.press(getByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(mockStopRecording).toHaveBeenCalled();
    });
  });

  it('does not start recording on long press when video long press is disabled', () => {
    const { getByTestId } = renderBottomControls({ enableVideoLongPress: false });

    fireEvent(getByTestId('lens-capture-button'), 'longPress');

    expect(mockCreateRecorder).not.toHaveBeenCalled();
  });

  it('alerts when capturePhotoToFile fails', async () => {
    mockCapturePhotoToFile.mockRejectedValueOnce(new Error('capture failed'));
    const { getByTestId } = renderBottomControls();

    fireEvent.press(getByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to capture');
    });
  });

  it('opens camera roll from thumbnail control', async () => {
    const { getByTestId } = renderBottomControls();

    fireEvent.press(getByTestId('lens-camera-roll-open'));

    expect(mockHandleCameraRollPress).toHaveBeenCalled();
  });

  it('opens camera roll inspector from thumbnail long press when recent media exists', async () => {
    mockUseCameraRollImpl.mockImplementation(() => ({
      animatedPhotoStyle: {},
      handleCameraRollPress: mockHandleCameraRollPress,
      handleCameraRollLongPress: mockHandleCameraRollLongPress,
      fetchRecentMedia: mockFetchRecentMedia,
      recentMedia: 'file:///roll-thumb.jpg',
    }));

    const { getByTestId } = renderBottomControls();

    fireEvent(getByTestId('lens-camera-roll-open'), 'longPress');

    expect(mockHandleCameraRollLongPress).toHaveBeenCalled();
  });

  it('does not wire long press when no recent media exists', () => {
    const { getByTestId } = renderBottomControls();

    expect(getByTestId('lens-camera-roll-open').props.onLongPress).toBeUndefined();
  });

  it('renders camera roll thumbnail when recent media exists', async () => {
    mockUseCameraRollImpl.mockImplementation(() => ({
      animatedPhotoStyle: {},
      handleCameraRollPress: mockHandleCameraRollPress,
      handleCameraRollLongPress: mockHandleCameraRollLongPress,
      fetchRecentMedia: mockFetchRecentMedia,
      recentMedia: 'file:///roll-thumb.jpg',
    }));

    const { findByTestId } = renderBottomControls();

    expect(await findByTestId('expo-image')).toBeTruthy();
  });
});
