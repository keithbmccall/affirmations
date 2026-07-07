import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { createAssetAsync } from 'expo-media-library';
import React, { createRef } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Camera as VisionCamera } from 'react-native-vision-camera';

import {
  CameraSurfaceContextForTesting,
  type CameraSurfaceContextValue,
} from './CameraSurfaceContext';
import { CameraBottomControls } from './CameraBottomControls';
import { CAMERA_VIEW_MODE } from './options';

const mockFetchRecentMedia = jest.fn(() => Promise.resolve());
const mockHandleCameraRollPress = jest.fn();
const mockRequestCameraRollHeadRefresh = jest.fn();

const mockUseLensPermissions = jest.fn(() => ({
  cameraPermission: true,
  mediaLibraryPermission: true,
  microphonePermission: true,
  requestCameraPermission: jest.fn(),
  requestMediaLibraryPermission: jest.fn(),
  requestMicrophonePermission: jest.fn(),
}));

jest.mock('@features/Lens/Camera/hooks/useLensPermissions', () => ({
  useLensPermissions: () => mockUseLensPermissions(),
}));

const mockUseCameraRollImpl = jest.fn((_hasAllPermissions: boolean) => ({
  animatedPhotoStyle: {},
  handleCameraRollPress: mockHandleCameraRollPress,
  fetchRecentMedia: mockFetchRecentMedia,
  recentMedia: null as string | null,
}));

jest.mock('@features/Lens/Camera/hooks/useCameraRoll', () => ({
  useCameraRoll: (hasAllPermissions: boolean) => mockUseCameraRollImpl(hasAllPermissions),
}));

jest.mock('@features/Lens/Camera/cameraRollPhotos/refreshCameraRollHead', () => ({
  requestCameraRollHeadRefresh: () => mockRequestCameraRollHeadRefresh(),
}));

jest.mock('expo-media-library', () => ({
  createAssetAsync: jest.fn(() =>
    Promise.resolve({ id: 'asset-1', uri: 'file:///asset', mediaType: 'photo' })
  ),
}));

jest.mock('expo-image', () => ({
  Image: () => {
    const RN = jest.requireActual('react-native');
    return <RN.View testID="expo-image" />;
  },
}));

const mockTakePhoto = jest.fn(() => Promise.resolve({ path: '/tmp/photo.jpg' }));
const mockStartRecording = jest.fn();
const mockStopRecording = jest.fn(() => Promise.resolve());

let pendingRecordingFinished: ((video: { path: string }) => void) | undefined;

jest.mock('react-native-vision-camera', () => {
  const RN = jest.requireActual('react-native');
  return {
    Camera: RN.View,
  };
});

const mockedCreateAssetAsync = createAssetAsync as jest.MockedFunction<typeof createAssetAsync>;

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
  cameraRef: React.RefObject<VisionCamera | null>,
  overrides: Partial<CameraSurfaceContextValue> = {}
): CameraSurfaceContextValue => ({
  cameraRef,
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
  const cameraRef = createRef<VisionCamera | null>();
  const result = render(
    <TestSafeArea>
      <CameraSurfaceContextForTesting.Provider
        value={createMockSurfaceContext(cameraRef, contextOverrides)}
      >
        <CameraBottomControls {...props} />
      </CameraSurfaceContextForTesting.Provider>
    </TestSafeArea>
  );
  return { ...result, cameraRef };
};

describe('CameraBottomControls', () => {
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    jest.clearAllMocks();
    mockUseCameraRollImpl.mockImplementation((_hasAllPermissions: boolean) => ({
      animatedPhotoStyle: {},
      handleCameraRollPress: mockHandleCameraRollPress,
      fetchRecentMedia: mockFetchRecentMedia,
      recentMedia: null,
    }));
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: true,
      mediaLibraryPermission: true,
      microphonePermission: true,
      requestCameraPermission: jest.fn(),
      requestMediaLibraryPermission: jest.fn(),
      requestMicrophonePermission: jest.fn(),
    });
    mockedCreateAssetAsync.mockResolvedValue({
      id: 'asset-1',
      uri: 'file:///asset',
      mediaType: 'photo',
    } as never);
    pendingRecordingFinished = undefined;
    mockStartRecording.mockImplementation(
      ({ onRecordingFinished }: { onRecordingFinished?: (v: { path: string }) => void }) => {
        pendingRecordingFinished = onRecordingFinished;
      }
    );
    mockStopRecording.mockImplementation(() => {
      pendingRecordingFinished?.({ path: '/tmp/video.mp4' });
      return Promise.resolve();
    });
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('fetches recent media on mount when media library permission is granted', async () => {
    renderBottomControls();

    await waitFor(() => {
      expect(mockFetchRecentMedia).toHaveBeenCalled();
    });
  });

  it('does not fetch recent media on mount when media library permission is false', async () => {
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: true,
      mediaLibraryPermission: false,
      microphonePermission: true,
      requestCameraPermission: jest.fn(),
      requestMediaLibraryPermission: jest.fn(),
      requestMicrophonePermission: jest.fn(),
    });

    renderBottomControls();

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetchRecentMedia).not.toHaveBeenCalled();
  });

  it('calls onPhotoCaptureStart before takePhoto when capturing a photo', async () => {
    const callOrder: string[] = [];
    const onPhotoCaptureStart = jest.fn(() => {
      callOrder.push('onPhotoCaptureStart');
      return { paletteSnapshot: {} };
    });
    mockTakePhoto.mockImplementation(async () => {
      callOrder.push('takePhoto');
      return { path: '/tmp/photo.jpg' };
    });

    const { cameraRef, getByTestId } = renderBottomControls({ onPhotoCaptureStart });

    await act(async () => {
      cameraRef.current = {
        takePhoto: mockTakePhoto,
        startRecording: mockStartRecording,
        stopRecording: mockStopRecording,
      } as unknown as VisionCamera;
    });

    fireEvent.press(getByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(callOrder).toEqual(['onPhotoCaptureStart', 'takePhoto']);
    });
  });

  it('saves photo and refreshes camera roll head after capture', async () => {
    const onPhotoAssetSaved = jest.fn(() => Promise.resolve());
    const { cameraRef, getByTestId } = renderBottomControls({ onPhotoAssetSaved });

    await act(async () => {
      cameraRef.current = {
        takePhoto: mockTakePhoto,
        startRecording: mockStartRecording,
        stopRecording: mockStopRecording,
      } as unknown as VisionCamera;
    });

    fireEvent.press(getByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(mockedCreateAssetAsync).toHaveBeenCalledWith('/tmp/photo.jpg');
      expect(onPhotoAssetSaved).toHaveBeenCalled();
      expect(mockFetchRecentMedia).toHaveBeenCalled();
      expect(mockRequestCameraRollHeadRefresh).toHaveBeenCalled();
    });
  });

  it('runs processPhotoPath before createAssetAsync', async () => {
    const processPhotoPath = jest.fn(() => Promise.resolve('file:///painted.jpg'));
    const { cameraRef, getByTestId } = renderBottomControls({ processPhotoPath });

    await act(async () => {
      cameraRef.current = {
        takePhoto: mockTakePhoto,
        startRecording: mockStartRecording,
        stopRecording: mockStopRecording,
      } as unknown as VisionCamera;
    });

    fireEvent.press(getByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(processPhotoPath).toHaveBeenCalledWith('/tmp/photo.jpg');
      expect(mockedCreateAssetAsync).toHaveBeenCalledWith('file:///painted.jpg');
    });
  });

  it('starts and stops video recording when video long press is enabled', async () => {
    const { cameraRef, getByTestId } = renderBottomControls({ enableVideoLongPress: true });

    await act(async () => {
      cameraRef.current = {
        takePhoto: mockTakePhoto,
        startRecording: mockStartRecording,
        stopRecording: mockStopRecording,
      } as unknown as VisionCamera;
    });

    fireEvent(getByTestId('lens-capture-button'), 'longPress');

    await waitFor(() => {
      expect(mockStartRecording).toHaveBeenCalled();
    });

    fireEvent.press(getByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(mockStopRecording).toHaveBeenCalled();
    });
  });

  it('does not start recording on long press when video long press is disabled', () => {
    const { cameraRef, getByTestId } = renderBottomControls({ enableVideoLongPress: false });

    act(() => {
      cameraRef.current = {
        takePhoto: mockTakePhoto,
        startRecording: mockStartRecording,
        stopRecording: mockStopRecording,
      } as unknown as VisionCamera;
    });

    fireEvent(getByTestId('lens-capture-button'), 'longPress');

    expect(mockStartRecording).not.toHaveBeenCalled();
  });

  it('alerts when takePhoto fails', async () => {
    mockTakePhoto.mockRejectedValueOnce(new Error('capture failed'));
    const { cameraRef, getByTestId } = renderBottomControls();

    await act(async () => {
      cameraRef.current = {
        takePhoto: mockTakePhoto,
        startRecording: mockStartRecording,
        stopRecording: mockStopRecording,
      } as unknown as VisionCamera;
    });

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

  it('renders camera roll thumbnail when recent media exists', async () => {
    mockUseCameraRollImpl.mockImplementation(() => ({
      animatedPhotoStyle: {},
      handleCameraRollPress: mockHandleCameraRollPress,
      fetchRecentMedia: mockFetchRecentMedia,
      recentMedia: 'file:///roll-thumb.jpg',
    }));

    const { findByTestId } = renderBottomControls();

    expect(await findByTestId('expo-image')).toBeTruthy();
  });
});
