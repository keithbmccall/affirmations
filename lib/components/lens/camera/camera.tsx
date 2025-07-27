import { createAssetAsync, usePermissions as useMediaLibraryPermissions } from 'expo-media-library';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Camera as VisionCamera,
  useCameraDevice,
  useCameraDevices,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';

import { ThemedText, ThemedView } from '@components/shared';
import { globalStyles, spacing } from '@styles';

// Props interface
interface CameraProps {
  statusBarProps?: any;
}

// Camera modes
const CAMERA_MODE = {
  PHOTO: 'photo',
  VIDEO: 'video',
  PORTRAIT: 'portrait',
  PANO: 'pano',
  SQUARE: 'square',
} as const;

// Flash modes
const FLASH_MODE = {
  OFF: 'off',
  ON: 'on',
  AUTO: 'auto',
} as const;

// Timer modes
const TIMER_MODE = {
  OFF: 0,
  THREE_SECONDS: 3,
  TEN_SECONDS: 10,
} as const;

const CAMERA_POSITION = {
  FRONT: 'front',
  BACK: 'back',
} as const;

// Type aliases
type CameraMode = (typeof CAMERA_MODE)[keyof typeof CAMERA_MODE];
type FlashMode = (typeof FLASH_MODE)[keyof typeof FLASH_MODE];
type TimerMode = (typeof TIMER_MODE)[keyof typeof TIMER_MODE];
type CameraPosition = (typeof CAMERA_POSITION)[keyof typeof CAMERA_POSITION];

// Component interfaces
interface TopControlsProps {
  showGrid: boolean;
  onGridToggle: () => void;
  flashMode: FlashMode;
  onFlashToggle: () => void;
  timerMode: TimerMode;
  onTimerToggle: () => void;
}

interface ModeSelectorProps {
  cameraMode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
}

interface BottomControlsProps {
  isRecording: boolean;
  onCapture: () => void;
  onSwitchCamera: () => void;
}

interface GridOverlayProps {
  showGrid: boolean;
}

interface FocusIndicatorProps {
  showFocusIndicator: boolean;
  focus: { x: number; y: number };
}

interface ZoomIndicatorProps {
  zoom: number;
}

// UI Components
const TopControls = ({
  showGrid,
  onGridToggle,
  flashMode,
  onFlashToggle,
  timerMode,
  onTimerToggle,
}: TopControlsProps) => (
  <ThemedView style={styles.topControls}>
    <TouchableOpacity style={styles.topButton} onPress={onGridToggle}>
      <ThemedText style={styles.topButtonIcon}>{showGrid ? '⊞' : '⊟'}</ThemedText>
    </TouchableOpacity>

    <TouchableOpacity style={styles.topButton} onPress={onFlashToggle}>
      <ThemedText style={styles.topButtonIcon}>
        {flashMode === FLASH_MODE.OFF ? '⚡' : flashMode === FLASH_MODE.ON ? '⚡' : '⚡'}
      </ThemedText>
    </TouchableOpacity>

    <TouchableOpacity style={styles.topButton} onPress={onTimerToggle}>
      <ThemedText style={styles.topButtonIcon}>
        {timerMode === TIMER_MODE.OFF ? '⏱️' : `${timerMode}s`}
      </ThemedText>
    </TouchableOpacity>
  </ThemedView>
);

const ModeSelector = ({ cameraMode, onModeChange }: ModeSelectorProps) => (
  <ThemedView style={styles.modeSelector}>
    {Object.values(CAMERA_MODE).map(mode => (
      <TouchableOpacity
        key={mode}
        style={[styles.modeButton, cameraMode === mode && styles.modeButtonActive]}
        onPress={() => onModeChange(mode)}
      >
        <ThemedText
          style={[styles.modeButtonText, cameraMode === mode && styles.modeButtonTextActive]}
        >
          {mode.toUpperCase()}
        </ThemedText>
      </TouchableOpacity>
    ))}
  </ThemedView>
);

const BottomControls = ({ isRecording, onCapture, onSwitchCamera }: BottomControlsProps) => (
  <ThemedView style={styles.bottomControls}>
    <TouchableOpacity style={styles.sideButton}>
      <ThemedText style={styles.sideButtonIcon}>🖼️</ThemedText>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.captureButton, isRecording && styles.captureButtonRecording]}
      onPress={onCapture}
    >
      <ThemedView style={styles.captureButtonInner} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.sideButton} onPress={onSwitchCamera}>
      <ThemedText style={styles.sideButtonIcon}>🔄</ThemedText>
    </TouchableOpacity>
  </ThemedView>
);

const GridOverlay = ({ showGrid }: GridOverlayProps) => {
  if (!showGrid) return null;

  return (
    <ThemedView style={styles.gridOverlay}>
      <ThemedView style={styles.gridLine} />
      <ThemedView style={styles.gridLine} />
      <ThemedView style={styles.gridLine} />
      <ThemedView style={styles.gridLine} />
    </ThemedView>
  );
};

const FocusIndicator = ({ showFocusIndicator, focus }: FocusIndicatorProps) => {
  if (!showFocusIndicator) return null;

  return (
    <ThemedView
      style={[
        styles.focusIndicator,
        {
          left: `${focus.x * 100}%`,
          top: `${focus.y * 100}%`,
        },
      ]}
    />
  );
};

const ZoomIndicator = ({ zoom }: ZoomIndicatorProps) => (
  <ThemedView style={styles.zoomIndicator}>
    <ThemedText style={styles.zoomText}>{zoom.toFixed(1)}x</ThemedText>
  </ThemedView>
);

// Main Camera Component
export const Camera = ({ statusBarProps }: CameraProps) => {
  // Camera setup
  const { hasPermission: cameraPermission, requestPermission: requestCameraPermission } =
    useCameraPermission();
  const [mediaLibraryPermissionStatus, requestMediaLibraryPermission] =
    useMediaLibraryPermissions();

  // State management
  const [cameraMode, setCameraMode] = useState<CameraMode>(CAMERA_MODE.PHOTO);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(CAMERA_POSITION.BACK);
  const [flashMode, setFlashMode] = useState<FlashMode>(FLASH_MODE.AUTO);
  const [timerMode, setTimerMode] = useState<TimerMode>(TIMER_MODE.OFF);
  const [showGrid, setShowGrid] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState({ x: 0.5, y: 0.5 });
  const [showFocusIndicator, setShowFocusIndicator] = useState(false);

  const devices = useCameraDevices();

  const device = useCameraDevice(cameraPosition, {
    physicalDevices: ['wide-angle-camera', 'ultra-wide-angle-camera', 'telephoto-camera'],
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
          flash: flashMode,
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
    setFlashMode(prev => {
      switch (prev) {
        case FLASH_MODE.OFF:
          return FLASH_MODE.AUTO;
        case FLASH_MODE.AUTO:
          return FLASH_MODE.ON;
        case FLASH_MODE.ON:
          return FLASH_MODE.OFF;
        default:
          return FLASH_MODE.AUTO;
      }
    });
  }, []);

  const handleTimerToggle = useCallback(() => {
    setTimerMode(prev => {
      switch (prev) {
        case TIMER_MODE.OFF:
          return TIMER_MODE.THREE_SECONDS;
        case TIMER_MODE.THREE_SECONDS:
          return TIMER_MODE.TEN_SECONDS;
        case TIMER_MODE.TEN_SECONDS:
          return TIMER_MODE.OFF;
        default:
          return TIMER_MODE.OFF;
      }
    });
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

  const handleSwitchCamera = useCallback(() => {
    setCameraPosition(prev =>
      prev === CAMERA_POSITION.BACK ? CAMERA_POSITION.FRONT : CAMERA_POSITION.BACK
    );
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

        {/* Overlays */}
        <GridOverlay showGrid={showGrid} />
        <FocusIndicator showFocusIndicator={showFocusIndicator} focus={focus} />
        <ZoomIndicator zoom={zoom} />
      </ThemedView>

      {/* UI Controls */}
      <TopControls
        showGrid={showGrid}
        onGridToggle={() => setShowGrid(!showGrid)}
        flashMode={flashMode}
        onFlashToggle={handleFlashToggle}
        timerMode={timerMode}
        onTimerToggle={handleTimerToggle}
      />
      <ModeSelector cameraMode={cameraMode} onModeChange={setCameraMode} />
      <BottomControls
        isRecording={isRecording}
        onCapture={handleCapture}
        onSwitchCamera={handleSwitchCamera}
      />
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
    top: spacing.screenPadding,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPadding,
    zIndex: 10,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    ...globalStyles.center,
  },
  topButtonIcon: {
    color: 'white',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPadding,
    zIndex: 10,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    ...globalStyles.center,
    borderWidth: 4,
    borderColor: 'white',
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
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    right: spacing.screenPadding,
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
