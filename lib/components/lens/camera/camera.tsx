import { Divider, ThemedText, ThemedView } from '@components/shared';
import { colors, globalStyles, spacing } from '@styles';
import { createAssetAsync, usePermissions as useMediaLibraryPermissions } from 'expo-media-library';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CameraPosition,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import {
  CAMERA_MODE,
  CAMERA_POSITION,
  cameraDeviceOptions,
  CameraMode,
  flashModeOptions,
} from './camera-options';

interface CameraProps {
  statusBarProps?: any;
}

const flashModeOptionsLength = flashModeOptions.length;
const cameraDeviceOptionsLength = cameraDeviceOptions.length;

export const Camera = ({ statusBarProps }: CameraProps) => {
  // Camera setup
  const { hasPermission: cameraPermission, requestPermission: requestCameraPermission } =
    useCameraPermission();
  const [mediaLibraryPermissionStatus, requestMediaLibraryPermission] =
    useMediaLibraryPermissions();
  const insets = useSafeAreaInsets();
  console.log({
    insets,
  });
  // State management
  const [cameraMode, setCameraMode] = useState<CameraMode>(CAMERA_MODE.PHOTO);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(CAMERA_POSITION.BACK);
  const [flashMode, setFlashMode] = useState<number>(0);
  const [cameraDevice, setCameraDevice] = useState<number>(0);

  const [showGrid, setShowGrid] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState({ x: 0.5, y: 0.5 });
  const [showFocusIndicator, setShowFocusIndicator] = useState(false);

  const device = useCameraDevice(cameraPosition, {
    physicalDevices: cameraDeviceOptions[cameraDevice].value,
  });

  const { hasPermission: microphonePermission, requestPermission: requestMicrophonePermission } =
    useMicrophonePermission();
  const camera = useRef<VisionCamera>(null);

  // Request permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Request camera permission if not granted
        if (!cameraPermission) {
          await requestCameraPermission();
        }

        // Request microphone permission if not granted
        if (!microphonePermission) {
          await requestMicrophonePermission();
        }

        if (!mediaLibraryPermissionStatus?.granted) {
          await requestMediaLibraryPermission();
        }
      } catch (error) {
        console.error('Permission request failed:', error);
        Alert.alert(
          'Permissions Required',
          'Camera and microphone and media library permissions are required to use this feature.',
          [{ text: 'OK' }]
        );
      }
    };

    requestPermissions();
  }, [
    cameraPermission,
    microphonePermission,
    requestCameraPermission,
    requestMicrophonePermission,
  ]);

  // Derived state
  const isVideoMode = cameraMode === CAMERA_MODE.VIDEO;
  const isPortraitMode = cameraMode === CAMERA_MODE.PORTRAIT;
  const hasAllPermissions = cameraPermission && microphonePermission;

  // Camera controls
  const handleCapture = useCallback(async () => {
    if (!camera.current) return;

    try {
      if (isVideoMode) {
        if (isRecording) {
          await camera.current.stopRecording();
          setIsRecording(false);
        } else {
          await camera.current.startRecording({
            onRecordingFinished: (video: any) => {
              Alert.alert('Video saved', `Video saved to: ${video.path}`);
            },
            onRecordingError: (error: any) => {
              Alert.alert('Recording error', error.message);
            },
          });
          setIsRecording(true);
        }
      } else {
        const photo = await camera.current.takePhoto({
          flash: flashModeOptions[flashMode].value,
        });
        const asset = await createAssetAsync(photo.path);
        console.log('asset', asset);
        Alert.alert('Photo taken', `Photo saved to: ${photo.path}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture');
    }
  }, [camera, isVideoMode, isRecording, flashMode]);

  const handleFlashToggle = useCallback(() => {
    setFlashMode(prev => (prev + 1) % flashModeOptionsLength);
  }, []);

  const handleSwitchCameraToggle = useCallback(() => {
    setCameraPosition(prev =>
      prev === CAMERA_POSITION.BACK ? CAMERA_POSITION.FRONT : CAMERA_POSITION.BACK
    );
  }, []);

  const handleCameraDeviceToggle = useCallback(() => {
    setCameraDevice(prev => (prev + 1) % cameraDeviceOptionsLength);
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(Math.max(0.5, Math.min(5, newZoom)));
  }, []);

  const handleCameraPress = useCallback((event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    // Focus logic can be implemented here
    setFocus({
      x: locationX / 100,
      y: locationY / 100,
    });
    setShowFocusIndicator(true);

    // Hide focus indicator after 2 seconds
    setTimeout(() => {
      setShowFocusIndicator(false);
    }, 2000);
  }, []);

  if (!device || !hasAllPermissions) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar {...statusBarProps} />
        <ThemedText type="title" style={styles.errorText}>
          {!device ? 'No camera available' : 'Camera permission required'}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar {...statusBarProps} />

      {/* Camera view */}
      <ThemedView style={styles.cameraContainer}>
        <VisionCamera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={hasAllPermissions}
          photo={true}
          video={true}
          audio={true}
          zoom={zoom}
        />

        {/* Touchable overlay for focus */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleCameraPress}
          activeOpacity={1}
        />

        {/* ===== GRID OVERLAY SECTION ===== */}
        {showGrid && (
          <>
            <ThemedView style={styles.gridOverlayColumn}>
              <Divider />
              <Divider />
            </ThemedView>
            <ThemedView style={styles.gridOverlayRow}>
              <Divider vertical />
              <Divider vertical />
            </ThemedView>
          </>
        )}

        {/* ===== FOCUS INDICATOR SECTION ===== */}
        {showFocusIndicator && (
          <ThemedView
            style={[
              styles.focusIndicator,
              {
                left: `${focus.x * 100}%`,
                top: `${focus.y * 100}%`,
              },
            ]}
          />
        )}

        {/* ===== ZOOM INDICATOR SECTION ===== */}
        <ThemedView style={styles.zoomIndicator}>
          <ThemedText style={styles.zoomText}>{zoom.toFixed(1)}x</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* ===== TOP CONTROLS SECTION ===== */}
      <ThemedView style={[styles.topControls, { top: insets.top + 60 }]}>
        <TouchableOpacity style={styles.topButton} onPress={() => setShowGrid(!showGrid)}>
          <ThemedText style={styles.topButtonIcon}>{showGrid ? '⊞' : '⊟'}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topButton} onPress={handleFlashToggle}>
          <ThemedText style={styles.topButtonIcon}>{flashModeOptions[flashMode].label}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topButton} onPress={handleSwitchCameraToggle}>
          <ThemedText style={styles.topButtonIcon}>🔄</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.topButton} onPress={handleCameraDeviceToggle}>
          <ThemedText style={styles.topButtonIcon}>💿</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* ===== MODE SELECTOR SECTION ===== */}
      {/* <ThemedView style={styles.modeSelector}>
        {Object.values(CAMERA_MODE).map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.modeButton, cameraMode === mode && styles.modeButtonActive]}
            onPress={() => setCameraMode(mode)}
          >
            <ThemedText
              style={[styles.modeButtonText, cameraMode === mode && styles.modeButtonTextActive]}
            >
              {mode.toUpperCase()}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView> */}

      {/* ===== BOTTOM CONTROLS SECTION ===== */}
      <ThemedView style={[styles.bottomControls, { bottom: insets.bottom + 40 }]}>
        <TouchableOpacity
          style={[styles.captureButton, isRecording && styles.captureButtonRecording]}
          onPress={handleCapture}
        >
          <ThemedView style={styles.captureButtonInner} />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
    backgroundColor: 'black',
  },
  cameraContainer: {
    ...globalStyles.flex1,
    position: 'relative',
  },
  errorText: {
    ...globalStyles.center,
    color: 'white',
  },
  topControls: {
    position: 'absolute',
    right: 0,
    ...globalStyles.flex1,
    gap: spacing.lg,
    marginHorizontal: spacing['2xl'],
    backgroundColor: colors.human.semiTransparent,
    borderRadius: 20,
    zIndex: 10,
  },
  topButton: {
    ...globalStyles.justifyCenter,
    ...globalStyles.alignCenter,
    padding: spacing.md,
    borderRadius: 20,
    height: 50,
  },
  topButtonIcon: {
    color: colors.human.white,
    fontSize: 20,
  },
  modeSelector: {
    position: 'absolute',
    top: spacing.screenPadding + 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 10,
  },
  modeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: spacing.borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modeButtonText: {
    color: 'white',
    fontSize: 12,
  },
  modeButtonTextActive: {
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: spacing.screenPadding,
    left: 0,
    right: 0,
    ...globalStyles.flexRow,
    ...globalStyles.justifyCenter,
    paddingHorizontal: spacing.screenPadding,
    zIndex: 10,
    backgroundColor: colors.human.transparent,
  },
  sideButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    ...globalStyles.center,
  },
  sideButtonIcon: {
    color: 'white',
    fontSize: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.human.transparent,
    ...globalStyles.center,
    borderWidth: 4,
    borderColor: colors.human.white,
  },
  captureButtonRecording: {
    backgroundColor: 'red',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  gridOverlayColumn: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    backgroundColor: colors.human.transparent,
    ...globalStyles.flexColumn,
    ...globalStyles.justifyEvenly,
  },
  gridOverlayRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    backgroundColor: colors.human.transparent,
    ...globalStyles.flexRow,
    ...globalStyles.justifyEvenly,
  },
  focusIndicator: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'yellow',
    backgroundColor: 'transparent',
    zIndex: 6,
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  zoomIndicator: {
    position: 'absolute',
    top: spacing.screenPadding + 120,
    left: spacing.screenPadding,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.md,
    zIndex: 10,
  },
  zoomText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
