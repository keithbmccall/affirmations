import { COLOR_LENS_MODE, type ColorLensMode } from '@features/Lens/ColorPalette/colorLensMode';
import { applyObskuraLensToPhotoFile } from '@features/Lens/Obskura/applyObskuraLensToPhotoFile';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { createAssetAsync } from 'expo-media-library';
import { router } from 'expo-router';
import React from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as VisionCameraModule from 'react-native-vision-camera';
import { Camera } from './Camera';

const mockOnAddLensPalette = jest.fn();
const mockFetchRecentMedia = jest.fn(() => Promise.resolve());
const mockHandleCameraRollPress = jest.fn();
const mockGetColorLensPaletteWorklet = jest.fn();
const mockGetColorLensRegionWorklet = jest.fn();
const mockRegionColor = { value: '#AABBCC' };

const mockPalette = {
  primaryColor: { value: '#111111' },
  secondaryColor: { value: '#222222' },
  tertiaryColor: { value: '#333333' },
  quaternaryColor: { value: '#444444' },
  quinaryColor: { value: '#555555' },
  senaryColor: { value: '#666666' },
  backgroundColor: { value: '#777777' },
  detailColor: { value: '#888888' },
};

const mockSetColorLensMode = jest.fn((updater: ColorLensMode | ((prev: ColorLensMode) => ColorLensMode)) => {
  if (typeof updater === 'function') {
    updater(COLOR_LENS_MODE.DISABLED);
  }
});

const mockUseColorLensPalette = jest.fn((): {
  colorLensMode: ColorLensMode;
  setColorLensMode: typeof mockSetColorLensMode;
  palette: typeof mockPalette;
  getColorLensPaletteWorklet: typeof mockGetColorLensPaletteWorklet;
} => ({
  colorLensMode: COLOR_LENS_MODE.DISABLED,
  setColorLensMode: mockSetColorLensMode,
  palette: mockPalette,
  getColorLensPaletteWorklet: mockGetColorLensPaletteWorklet,
}));

jest.mock('@components/shared/icon-symbol/IconSymbol', () => ({
  IconSymbol: ({ name }: { name: string }) => {
    const RN = jest.requireActual('react-native');
    return <RN.View testID={`icon-${name}`} />;
  },
}));

jest.mock('@platform', () => ({
  useLens: () => ({ onAddLensPalette: mockOnAddLensPalette }),
}));

jest.mock('@features/Lens/ColorPalette/useColorLensPalette', () => ({
  useColorLensPalette: () => mockUseColorLensPalette(),
}));

jest.mock('@features/Lens/ColorPalette/useColorLensRegion', () => ({
  useColorLensRegion: () => ({
    getColorLensRegionWorklet: mockGetColorLensRegionWorklet,
    regionColor: mockRegionColor,
  }),
}));

jest.mock('@features/Lens/ColorPalette/ColorPalette', () => ({
  ColorPalette: () => {
    const RN = jest.requireActual('react-native');
    return <RN.View testID="color-palette-mock" />;
  },
}));

jest.mock('./LensColorRegionIndicator', () => ({
  LensColorRegionIndicator: () => {
    const RN = jest.requireActual('react-native');
    return <RN.View testID="lens-color-region-indicator" />;
  },
}));

jest.mock('@features/Lens/Obskura/applyObskuraLensToPhotoFile', () => ({
  applyObskuraLensToPhotoFile: jest.fn(() => Promise.resolve('file:///painted.jpg')),
}));

jest.mock('expo-media-library', () => ({
  createAssetAsync: jest.fn(() =>
    Promise.resolve({ id: 'asset-1', uri: 'file:///asset', mediaType: 'photo' })
  ),
}));

jest.mock('expo-image', () => ({
  Image: (props: { testID?: string }) => {
    const RN = jest.requireActual('react-native');
    return <RN.View testID={props.testID ?? 'expo-image'} />;
  },
}));

const mockTakePhoto = jest.fn(() => Promise.resolve({ path: '/tmp/photo.jpg' }));
const mockStartRecording = jest.fn();
const mockStopRecording = jest.fn(() => Promise.resolve());

let pendingRecordingFinished: ((video: { path: string }) => void) | undefined;

jest.mock('@features/Lens/Obskura/pipeline/buildObskuraLensPaintFromPipeline', () => ({
  buildObskuraLensPaintFromPipeline: jest.fn(() => ({ dispose: jest.fn() })),
}));

jest.mock('@features/Lens/Obskura/pipeline/obskuraLensPipelineConfig', () => ({
  OBSKURA_LENS_PIPELINE: [{ action: 'blur', settings: { sigma: 60 } }],
}));

jest.mock('react-native-vision-camera', () => {
  const React = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  const VisionCamera = React.forwardRef(function VisionCameraMock(
    props: { testID?: string },
    ref: unknown
  ) {
    React.useImperativeHandle(ref, () => ({
      takePhoto: mockTakePhoto,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    }));
    return <RN.View testID={props.testID ?? 'vision-camera-mock'} />;
  });
  return {
    Camera: VisionCamera,
    Templates: {
      FrameProcessing: [{ videoResolution: { width: 1080, height: 720 } }],
    },
    useCameraDevice: jest.fn(() => ({ id: 'mock-device' })),
    useCameraFormat: jest.fn(() => ({
      videoWidth: 1080,
      videoHeight: 720,
      photoWidth: 4032,
      photoHeight: 3024,
    })),
    useFrameProcessor: jest.fn((processor: (f: unknown) => void) => {
      try {
        processor({});
      } catch {
        /* worklet body may throw outside native runtime */
      }
      return processor;
    }),
    useSkiaFrameProcessor: jest.fn((processor: (f: unknown) => void) => {
      try {
        processor({ render: jest.fn() });
      } catch {
        /* Skia worklet may throw outside native runtime */
      }
      return processor;
    }),
  };
});

jest.mock('@features/Lens/Camera/CameraGrid', () => ({
  CameraGrid: () => {
    const RN = jest.requireActual('react-native');
    return <RN.View testID="camera-grid-mock" />;
  },
}));

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

jest.mock('@features/Lens/Camera/hooks/useCameraFocus', () => ({
  useCameraFocus: () => ({ handleFocusTap: jest.fn() }),
}));

let mockFocusCleanup: (() => void) | undefined;

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  return {
    router: { back: jest.fn(), push: jest.fn() },
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useLayoutEffect(() => {
        const out = cb();
        mockFocusCleanup = typeof out === 'function' ? out : undefined;
        return () => {
          mockFocusCleanup = undefined;
          if (typeof out === 'function') {
            out();
          }
        };
      }, []);
    },
  };
});

const mockedCreateAssetAsync = createAssetAsync as jest.MockedFunction<typeof createAssetAsync>;
const mockedApplyObskuraLensToPhotoFile = jest.mocked(applyObskuraLensToPhotoFile);
const mockedVisionCameraModule = jest.mocked(VisionCameraModule);

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

const renderCamera = (ui: React.ReactElement) => render(ui, { wrapper: TestSafeArea });

describe('Camera', () => {
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
    mockFocusCleanup = undefined;
    mockUseColorLensPalette.mockReturnValue({
      colorLensMode: COLOR_LENS_MODE.DISABLED,
      setColorLensMode: mockSetColorLensMode,
      palette: mockPalette,
      getColorLensPaletteWorklet: mockGetColorLensPaletteWorklet,
    });
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: true,
      mediaLibraryPermission: true,
      microphonePermission: true,
      requestCameraPermission: jest.fn(),
      requestMediaLibraryPermission: jest.fn(),
      requestMicrophonePermission: jest.fn(),
    });
    mockStartRecording.mockImplementation(
      ({ onRecordingFinished }: { onRecordingFinished?: (v: { path: string }) => void }) => {
        pendingRecordingFinished = onRecordingFinished;
      }
    );
    mockStopRecording.mockImplementation(() => {
      pendingRecordingFinished?.({ path: '/tmp/video.mp4' });
      return Promise.resolve();
    });
    pendingRecordingFinished = undefined;
    mockTakePhoto.mockResolvedValue({ path: '/tmp/photo.jpg' });
    mockedCreateAssetAsync.mockResolvedValue({
      id: 'asset-1',
      uri: 'file:///asset',
      mediaType: 'photo',
    } as never);
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('renders lens surface when device and permissions are available', async () => {
    renderCamera(<Camera />);

    expect(await screen.findByTestId('vision-camera-mock')).toBeTruthy();
  });

  it('shows no camera message when device is missing', async () => {
    mockedVisionCameraModule.useCameraDevice.mockReturnValueOnce(undefined);

    renderCamera(<Camera />);

    expect(await screen.findByText('No camera available')).toBeTruthy();
  });

  it('shows permission message when a permission is missing', async () => {
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: false,
      mediaLibraryPermission: true,
      microphonePermission: true,
      requestCameraPermission: jest.fn(),
      requestMediaLibraryPermission: jest.fn(),
      requestMicrophonePermission: jest.fn(),
    });

    renderCamera(<Camera />);

    expect(await screen.findByText('Camera permission required')).toBeTruthy();
  });

  it('shows grid overlay when in permission error state', async () => {
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: false,
      mediaLibraryPermission: true,
      microphonePermission: true,
      requestCameraPermission: jest.fn(),
      requestMediaLibraryPermission: jest.fn(),
      requestMicrophonePermission: jest.fn(),
    });

    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-control-grid'));

    expect(screen.getByTestId('camera-grid-mock')).toBeTruthy();
  });

  it('shows grid on error state when device is missing', async () => {
    mockedVisionCameraModule.useCameraDevice.mockReturnValueOnce(undefined);

    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-control-grid'));

    expect(screen.getByTestId('camera-grid-mock')).toBeTruthy();
  });

  it('navigates back from header button', async () => {
    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-back-button'));

    expect(router.back).toHaveBeenCalled();
  });

  it('toggles to Obskura surface and shows Obskura color control', async () => {
    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-control-view-mode'));

    expect(await screen.findByTestId('lens-control-obskura-color-mode')).toBeTruthy();
    expect(screen.queryByTestId('lens-toggle-color-lens')).toBeNull();
  });

  it('toggles grid overlay', async () => {
    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-control-grid'));

    expect(await screen.findByTestId('camera-grid-mock')).toBeTruthy();
  });

  it('shows outline palette icon on the color lens toggle when disabled', async () => {
    renderCamera(<Camera />);

    expect(await screen.findByTestId('icon-swatchpalette')).toBeTruthy();
    expect(screen.queryByTestId('icon-swatchpalette.fill')).toBeNull();
    expect(screen.queryByTestId('icon-scope')).toBeNull();
  });

  it('shows color palette when color lens is in lens-dominant mode', async () => {
    mockUseColorLensPalette.mockReturnValue({
      colorLensMode: COLOR_LENS_MODE.LENS_DOMINANT,
      setColorLensMode: mockSetColorLensMode,
      palette: mockPalette,
      getColorLensPaletteWorklet: mockGetColorLensPaletteWorklet,
    });

    renderCamera(<Camera />);

    expect(await screen.findByTestId('color-palette-mock')).toBeTruthy();
    expect(await screen.findByTestId('icon-swatchpalette.fill')).toBeTruthy();
    expect(screen.queryByTestId('icon-scope')).toBeNull();
    expect(screen.queryByTestId('icon-swatchpalette')).toBeNull();
  });

  it('shows scope icon on the color lens toggle in lens-point mode', async () => {
    mockUseColorLensPalette.mockReturnValue({
      colorLensMode: COLOR_LENS_MODE.LENS_POINT,
      setColorLensMode: mockSetColorLensMode,
      palette: mockPalette,
      getColorLensPaletteWorklet: mockGetColorLensPaletteWorklet,
    });

    renderCamera(<Camera />);

    expect(await screen.findByTestId('icon-scope')).toBeTruthy();
    expect(screen.queryByTestId('icon-swatchpalette.fill')).toBeNull();
    expect(screen.queryByTestId('icon-swatchpalette')).toBeNull();
  });

  it('shows color region indicator when color lens is in lens-point mode', async () => {
    mockUseColorLensPalette.mockReturnValue({
      colorLensMode: COLOR_LENS_MODE.LENS_POINT,
      setColorLensMode: mockSetColorLensMode,
      palette: mockPalette,
      getColorLensPaletteWorklet: mockGetColorLensPaletteWorklet,
    });

    renderCamera(<Camera />);

    expect(await screen.findByTestId('lens-color-region-indicator')).toBeTruthy();
    expect(screen.queryByTestId('color-palette-mock')).toBeNull();
  });

  it('saves a plain photo in lens mode when color lens is disabled', async () => {
    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(mockTakePhoto).toHaveBeenCalled();
      expect(mockOnAddLensPalette).not.toHaveBeenCalled();
      expect(mockedCreateAssetAsync).toHaveBeenCalledWith('/tmp/photo.jpg');
    });
  });

  it('captures photo in lens mode with lens-dominant color lens and notifies palette', async () => {
    mockUseColorLensPalette.mockReturnValue({
      colorLensMode: COLOR_LENS_MODE.LENS_DOMINANT,
      setColorLensMode: mockSetColorLensMode,
      palette: mockPalette,
      getColorLensPaletteWorklet: mockGetColorLensPaletteWorklet,
    });

    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(mockTakePhoto).toHaveBeenCalled();
      expect(mockedCreateAssetAsync).toHaveBeenCalledWith('/tmp/photo.jpg');
      expect(mockOnAddLensPalette).toHaveBeenCalled();
    });
  });

  it('captures photo in Obskura mode and saves painted asset', async () => {
    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-control-view-mode'));
    await waitFor(() => {
      expect(screen.getByTestId('lens-control-obskura-color-mode')).toBeTruthy();
    });

    fireEvent.press(await screen.findByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(mockedApplyObskuraLensToPhotoFile).toHaveBeenCalled();
      expect(mockedCreateAssetAsync).toHaveBeenCalledWith('file:///painted.jpg');
    });
  });

  it('starts and stops video recording from capture button', async () => {
    renderCamera(<Camera />);

    fireEvent(screen.getByTestId('lens-capture-button'), 'longPress');

    await waitFor(() => {
      expect(mockStartRecording).toHaveBeenCalled();
    });

    fireEvent.press(screen.getByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(mockStopRecording).toHaveBeenCalled();
    });
  });

  it('does not start recording on long press in Obskura mode', async () => {
    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-control-view-mode'));
    mockStartRecording.mockClear();

    fireEvent(screen.getByTestId('lens-capture-button'), 'longPress');

    expect(mockStartRecording).not.toHaveBeenCalled();
  });

  it('alerts when takePhoto fails', async () => {
    mockTakePhoto.mockRejectedValueOnce(new Error('capture failed'));

    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-capture-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to capture');
    });
  });

  it('alerts when startRecording throws', async () => {
    mockStartRecording.mockImplementationOnce(() => {
      throw new Error('rec fail');
    });

    renderCamera(<Camera />);

    fireEvent(screen.getByTestId('lens-capture-button'), 'longPress');

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Failed to record video');
    });
  });

  it('alerts on recording error callback', async () => {
    mockStartRecording.mockImplementationOnce(
      ({ onRecordingError }: { onRecordingError?: (e: { message: string }) => void }) => {
        onRecordingError?.({ message: 'codec' });
      }
    );

    renderCamera(<Camera />);

    fireEvent(screen.getByTestId('lens-capture-button'), 'longPress');

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Recording error', 'codec');
    });
  });

  it('opens camera roll from thumbnail control', async () => {
    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-camera-roll-open'));

    expect(mockHandleCameraRollPress).toHaveBeenCalled();
  });

  it('runs focus effect cleanup to suspend camera', async () => {
    renderCamera(<Camera />);

    await act(async () => {
      mockFocusCleanup?.();
    });

    expect(mockFocusCleanup).toBeDefined();
  });

  it('fetches recent media when media library permission is granted on mount', async () => {
    renderCamera(<Camera />);

    await waitFor(() => {
      expect(mockFetchRecentMedia).toHaveBeenCalled();
    });
  });

  it('does not fetch recent media when media library permission is false', async () => {
    mockFetchRecentMedia.mockClear();
    mockUseLensPermissions.mockReturnValue({
      cameraPermission: true,
      mediaLibraryPermission: false,
      microphonePermission: true,
      requestCameraPermission: jest.fn(),
      requestMediaLibraryPermission: jest.fn(),
      requestMicrophonePermission: jest.fn(),
    });

    renderCamera(<Camera />);

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockFetchRecentMedia).not.toHaveBeenCalled();
  });

  it('renders camera roll thumbnail when recent media exists', async () => {
    mockUseCameraRollImpl.mockImplementation((_hasAllPermissions: boolean) => ({
      animatedPhotoStyle: {},
      handleCameraRollPress: mockHandleCameraRollPress,
      fetchRecentMedia: mockFetchRecentMedia,
      recentMedia: 'file:///roll-thumb.jpg',
    }));

    renderCamera(<Camera />);

    expect(await screen.findByTestId('expo-image')).toBeTruthy();
  });

  it('cycles color lens mode when palette toggle is pressed', async () => {
    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-toggle-color-lens'));

    expect(mockSetColorLensMode).toHaveBeenCalled();
    const updater = mockSetColorLensMode.mock.calls[0][0] as (
      prev: ColorLensMode
    ) => ColorLensMode;
    expect(updater(COLOR_LENS_MODE.DISABLED)).toBe(COLOR_LENS_MODE.LENS_DOMINANT);
    expect(updater(COLOR_LENS_MODE.LENS_DOMINANT)).toBe(COLOR_LENS_MODE.LENS_POINT);
    expect(updater(COLOR_LENS_MODE.LENS_POINT)).toBe(COLOR_LENS_MODE.DISABLED);
  });

  it('cycles flash, flip, lens device, color lens toggle, and Obskura color mode', async () => {
    renderCamera(<Camera />);

    fireEvent.press(await screen.findByTestId('lens-control-flash'));
    fireEvent.press(screen.getByTestId('lens-control-flip-camera'));
    fireEvent.press(screen.getByTestId('lens-control-flip-camera'));
    fireEvent.press(screen.getByTestId('lens-control-lens-device'));

    fireEvent.press(screen.getByTestId('lens-toggle-color-lens'));

    fireEvent.press(screen.getByTestId('lens-control-view-mode'));
    fireEvent.press(await screen.findByTestId('lens-control-obskura-color-mode'));
    fireEvent.press(screen.getByTestId('lens-control-obskura-color-mode'));

    fireEvent.press(screen.getByTestId('lens-control-view-mode'));
    expect(await screen.findByTestId('vision-camera-mock')).toBeTruthy();
  });
});
