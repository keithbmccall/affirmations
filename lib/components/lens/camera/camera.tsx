import { Divider, ThemedText, ThemedView } from '@components/shared';
import { colors, globalStyles, spacing } from '@styles';
import { createAssetAsync } from 'expo-media-library';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CameraPosition,
  useCameraDevice,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import {
  CAMERA_MODE,
  CAMERA_POSITION,
  cameraDeviceOptions,
  CameraMode,
  flashModeOptions,
} from './camera-options';
import { useCameraFocus } from './use-camera-focus';
import { useCameraRoll } from './use-camera-roll';
import { useLensPermissions } from './use-lens-permissions';

const flashModeOptionsLength = flashModeOptions.length;
const cameraDeviceOptionsLength = cameraDeviceOptions.length;

interface CameraProps {}
export const Camera = ({}: CameraProps) => {
  const { cameraPermission, mediaLibraryPermission, microphonePermission } = useLensPermissions();
  const insets = useSafeAreaInsets();

  // State management
  const [cameraDevice, setCameraDevice] = useState<number>(0);
  const [cameraMode, setCameraMode] = useState<CameraMode>(CAMERA_MODE.PHOTO);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(CAMERA_POSITION.BACK);
  const [flashMode, setFlashMode] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  const device = useCameraDevice(cameraPosition, {
    physicalDevices: cameraDeviceOptions[cameraDevice].value,
  });

  const camera = useRef<VisionCamera>(null);

  const { handleFocusTap: handleTap, focusIndicatorAnimatedStyle } = useCameraFocus(camera);

  const hasAllPermissions = cameraPermission && microphonePermission && mediaLibraryPermission;
  const { animatedPhotoStyle, handleCameraRollPress, fetchRecentPhoto, recentPhoto } =
    useCameraRoll(hasAllPermissions);
  // Derived state
  const isVideoMode = cameraMode === CAMERA_MODE.VIDEO;
  const isPortraitMode = cameraMode === CAMERA_MODE.PORTRAIT;

  // Camera controls
  const handleCapture = async () => {
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
        await createAssetAsync(photo.path);
        fetchRecentPhoto();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture');
    }
  };

  const handleFlashToggle = () => {
    setFlashMode(prev => (prev + 1) % flashModeOptionsLength);
  };

  const handleSwitchCameraToggle = () => {
    setCameraPosition(prev =>
      prev === CAMERA_POSITION.BACK ? CAMERA_POSITION.FRONT : CAMERA_POSITION.BACK
    );
  };

  const handleCameraDeviceToggle = () => {
    setCameraDevice(prev => (prev + 1) % cameraDeviceOptionsLength);
  };

  const handleBackPress = () => {
    router.back();
  };

  // Fetch recent photo when permissions are granted
  useEffect(() => {
    if (mediaLibraryPermission) {
      fetchRecentPhoto();
    }
  }, [mediaLibraryPermission]);

  const gesture = Gesture.Tap().onEnd(({ x, y }) => {
    console.log({ x, y });
    runOnJS(handleTap)(x, y);
  });

  if (!device || !hasAllPermissions) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.errorText}>
          {!device ? 'No camera available' : 'Camera permission required'}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Camera view */}
      <ThemedView style={styles.cameraContainer}>
        <GestureDetector gesture={gesture}>
          <View style={{ ...globalStyles.flex1 }}>
            <VisionCamera
              ref={camera}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={hasAllPermissions}
              photo={true}
              video={true}
              audio={true}
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
          </View>
        </GestureDetector>

        {/* ===== FOCUS INDICATOR SECTION ===== */}
        <Animated.View style={[styles.focusIndicator, focusIndicatorAnimatedStyle]} />

        {/* ===== BACK BUTTON SECTION ===== */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top }]}
          onPress={handleBackPress}
        >
          <ThemedText style={styles.backButtonIcon}>←</ThemedText>
        </TouchableOpacity>
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

        {cameraDeviceOptionsLength > 1 && (
          <TouchableOpacity style={styles.topButton} onPress={handleCameraDeviceToggle}>
            <ThemedText style={styles.topButtonIcon}>💿</ThemedText>
          </TouchableOpacity>
        )}
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
        {/* Camera Roll Button */}
        <TouchableOpacity style={styles.cameraRollButton} onPress={handleCameraRollPress}>
          {recentPhoto ? (
            <Animated.View
              key={recentPhoto} // Force new component instance
              style={[styles.cameraRollPreviewContainer, animatedPhotoStyle]}
            >
              <Image source={{ uri: recentPhoto }} style={styles.cameraRollPreview} />
            </Animated.View>
          ) : (
            <ThemedText style={styles.cameraRollIcon}>📷</ThemedText>
          )}
        </TouchableOpacity>

        {/* Capture Button */}
        <TouchableOpacity
          style={[styles.captureButton, isRecording && styles.captureButtonRecording]}
          onPress={handleCapture}
        >
          <ThemedView style={styles.captureButtonInner} />
        </TouchableOpacity>

        <ThemedView style={styles.bottomStub} />
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
    ...globalStyles.absolute,
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
  bottomControls: {
    ...globalStyles.absolute,
    bottom: spacing.screenPadding,
    left: 0,
    right: 0,
    ...globalStyles.rowBetween,
    paddingHorizontal: spacing.screenPadding,
    zIndex: 10,
    backgroundColor: colors.human.transparent,
  },
  bottomStub: {
    width: 80,
    height: 80,
    backgroundColor: colors.human.transparent,
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
    ...globalStyles.absoluteFill,
    backgroundColor: colors.human.transparent,
    ...globalStyles.flexColumn,
    ...globalStyles.justifyEvenly,
  },
  gridOverlayRow: {
    ...globalStyles.absoluteFill,
    backgroundColor: colors.human.transparent,
    ...globalStyles.flexRow,
    ...globalStyles.justifyEvenly,
  },
  focusIndicator: {
    ...globalStyles.absolute,
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.human.white,
    backgroundColor: 'transparent',
    zIndex: 6,
    shadowColor: colors.human.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  backButton: {
    ...globalStyles.absolute,
    left: 0,
    marginHorizontal: spacing['2xl'],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.human.semiTransparent,
    ...globalStyles.justifyCenter,
    ...globalStyles.alignCenter,
    zIndex: 10,
    paddingTop: 5,
  },
  backButtonIcon: {
    color: colors.human.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
  cameraRollButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    padding: 10,
    backgroundColor: colors.human.semiTransparent,
    ...globalStyles.center,
    borderWidth: 2,
    borderColor: colors.human.white,
    ...globalStyles.overflowHidden,
  },
  cameraRollPreviewContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  cameraRollPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  cameraRollIcon: {
    color: colors.human.white,
    fontSize: 24,
  },
});
