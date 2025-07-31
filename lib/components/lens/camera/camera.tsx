import { Divider, IconSymbol, ThemedText, ThemedView } from '@components/shared';
import {
  CAMERA_MODE,
  CAMERA_POSITION,
  cameraDeviceOptions,
  CameraMode,
  flashModeOptions,
  getColorLensPalette,
  gridModeOptions,
  useCameraFocus,
  useCameraRoll,
  useLensPermissions,
} from '@features/lens';
import { colors, globalStyles, spacing } from '@styles';
import { createAssetAsync } from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CameraPosition,
  useCameraDevice,
  useFrameProcessor,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import CameraTile from './camera-tile';

const flashModeOptionsLength = flashModeOptions.length;
const cameraDeviceOptionsLength = cameraDeviceOptions.length;
const controlSymbolSize = 30;

const ReanimatedCamera = Reanimated.createAnimatedComponent(VisionCamera);
Reanimated.addWhitelistedNativeProps({
  isActive: true,
});
const frameProcessorFps = 3;

interface CameraProps {}
export const Camera = ({}: CameraProps) => {
  const { cameraPermission, mediaLibraryPermission, microphonePermission } = useLensPermissions();
  const insets = useSafeAreaInsets();

  // State management
  const [cameraDevice, setCameraDevice] = useState<number>(0);
  const [cameraMode, setCameraMode] = useState<CameraMode>(CAMERA_MODE.PHOTO);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(CAMERA_POSITION.BACK);
  const [flashMode, setFlashMode] = useState<number>(0);
  const [gridMode, setGridMode] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);

  const device = useCameraDevice(cameraPosition, {
    physicalDevices: cameraDeviceOptions[cameraDevice].value,
  });

  const camera = useRef<VisionCamera>(null);

  const { handleFocusTap: handleTap, focusIndicatorAnimatedStyle } = useCameraFocus(camera);

  const hasAllPermissions = cameraPermission && microphonePermission && mediaLibraryPermission;
  const { animatedPhotoStyle, handleCameraRollPress, fetchRecentPhoto, recentPhoto } =
    useCameraRoll(hasAllPermissions);

  // Camera suspension state
  const [isCameraActive, setIsCameraActive] = useState(true);
  // Derived state
  const isVideoMode = cameraMode === CAMERA_MODE.VIDEO;
  const isPortraitMode = cameraMode === CAMERA_MODE.PORTRAIT;
  const showGrid = gridModeOptions[gridMode].value === 'on';

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

  const handleGridToggle = () => {
    setGridMode(prev => (prev + 1) % gridModeOptions.length);
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

  // Camera suspension logic - suspend when screen loses focus
  useFocusEffect(
    useCallback(() => {
      // Screen is focused - activate camera
      console.log('Camera: Screen focused - activating camera');
      setIsCameraActive(true);

      return () => {
        // Screen is unfocused - suspend camera
        console.log('Camera: Screen unfocused - suspending camera');
        setIsCameraActive(false);
      };
    }, [])
  );

  const gesture = Gesture.Tap().onEnd(({ x, y }) => {
    console.log({ x, y });
    runOnJS(handleTap)(x, y);
  });

  const SCREEN_WIDTH = Dimensions.get('window').width;
  const SAFE_BOTTOM = 100;

  const DEFAULT_COLOR = '#000000';
  const MAX_FRAME_PROCESSOR_FPS = 3;

  const TILE_SIZE = SCREEN_WIDTH / 4;
  const ACTIVE_TILE_HEIGHT = TILE_SIZE * 1.3 + SAFE_BOTTOM;
  const ACTIVE_TILE_SCALE = 0.9;
  const ACTIVE_CONTAINER_SCALE = 0.95;
  const ACTIVE_CONTAINER_PADDING = TILE_SIZE - TILE_SIZE * ACTIVE_TILE_SCALE;
  const TRANSLATE_Y_ACTIVE =
    (SCREEN_WIDTH - SCREEN_WIDTH * ACTIVE_CONTAINER_SCALE) / 2 + SAFE_BOTTOM;
  const isHolding = useSharedValue(false);

  const primaryColor = useSharedValue(DEFAULT_COLOR);
  const secondaryColor = useSharedValue(DEFAULT_COLOR);
  const backgroundColor = useSharedValue(DEFAULT_COLOR);
  const detailColor = useSharedValue(DEFAULT_COLOR);

  const isActiveAnimation = useDerivedValue(
    () =>
      withSpring(isHolding.value ? 0 : 1, {
        mass: 1,
        damping: 500,
        stiffness: 800,
        restDisplacementThreshold: 0.0001,
      }),
    [isHolding]
  );
  const palettesStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          scale: interpolate(isActiveAnimation.value, [0, 1], [1, ACTIVE_CONTAINER_SCALE]),
        },
        {
          translateY: interpolate(isActiveAnimation.value, [0, 1], [0, -TRANSLATE_Y_ACTIVE]),
        },
      ],
      padding: interpolate(isActiveAnimation.value, [0, 1], [0, ACTIVE_CONTAINER_PADDING]),
      borderRadius: interpolate(isActiveAnimation.value, [0, 1], [0, 25]),
    }),
    [isActiveAnimation]
  );
  const colorTileStyle = useAnimatedStyle(
    () => ({
      borderRadius: interpolate(isActiveAnimation.value, [0, 1], [0, 15]),
      transform: [
        {
          scale: interpolate(isActiveAnimation.value, [0, 1], [1, ACTIVE_TILE_SCALE]),
        },
      ],
      width: TILE_SIZE,
      height: interpolate(isActiveAnimation.value, [0, 1], [ACTIVE_TILE_HEIGHT, TILE_SIZE]),
      paddingBottom: interpolate(isActiveAnimation.value, [0, 1], [SAFE_BOTTOM, 0]),
    }),
    [isActiveAnimation]
  );
  const colorAnimationDuration = useMemo(() => (1 / frameProcessorFps) * 1000, [frameProcessorFps]);
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      // Only process frames when camera is active
      if (!isCameraActive) return;

      const colorPalette = getColorLensPalette(frame);

      // Handle the color palette returned from Swift frame processor
      if (colorPalette) {
        primaryColor.value = colorPalette.primary;
        secondaryColor.value = colorPalette.secondary;
        backgroundColor.value = colorPalette.background;
        detailColor.value = colorPalette.detail;
      } else {
        // Fallback to default colors if frame processor fails
        primaryColor.value = colors.human.primary as string;
        secondaryColor.value = colors.human.secondary as string;
        backgroundColor.value = colors.human.background as string;
        detailColor.value = colors.human.detail as string;
      }
      console.log('colorPalette', colorPalette);
    },
    [isCameraActive]
  );

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
            <ReanimatedCamera
              ref={camera}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={hasAllPermissions && isCameraActive}
              photo
              video
              audio
              frameProcessor={isCameraActive ? frameProcessor : undefined}
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
        <Reanimated.View style={[styles.focusIndicator, focusIndicatorAnimatedStyle]} />

        {/* ===== CAMERA SUSPENDED INDICATOR ===== */}
        {!isCameraActive && (
          <ThemedView style={styles.cameraSuspendedIndicator}>
            <ThemedText style={styles.cameraSuspendedText}>Camera Suspended</ThemedText>
          </ThemedView>
        )}

        {/* ===== BACK BUTTON SECTION ===== */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top }]}
          onPress={handleBackPress}
        >
          <IconSymbol size={controlSymbolSize} color={colors.human.white} name="chevron.left" />
        </TouchableOpacity>
      </ThemedView>

      {/* ===== TOP CONTROLS SECTION ===== */}
      <ThemedView style={[styles.topControls, { top: insets.top + 60 }]}>
        <TouchableOpacity style={styles.topButton} onPress={handleGridToggle}>
          <IconSymbol
            size={controlSymbolSize}
            color={colors.human.white}
            name={gridModeOptions[gridMode].icon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topButton} onPress={handleFlashToggle}>
          <IconSymbol
            size={controlSymbolSize}
            color={colors.human.white}
            name={flashModeOptions[flashMode].icon}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topButton} onPress={handleSwitchCameraToggle}>
          <IconSymbol
            size={controlSymbolSize}
            color={colors.human.white}
            name="arrow.trianglehead.2.clockwise.rotate.90.circle"
          />
        </TouchableOpacity>

        {cameraDeviceOptionsLength > 1 && (
          <TouchableOpacity style={styles.topButton} onPress={handleCameraDeviceToggle}>
            <ThemedText style={styles.topButtonIcon}>💿</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      <ThemedView style={[styles.topControls, { top: insets.top + 60, left: 0, right: undefined }]}>
        <CameraTile
          key={`primary`}
          name={`primary`}
          color={primaryColor}
          animatedStyle={colorTileStyle}
          animationDuration={colorAnimationDuration}
        />
        <CameraTile
          key={`secondary`}
          name={`secondary`}
          color={secondaryColor}
          animatedStyle={colorTileStyle}
          animationDuration={colorAnimationDuration}
        />
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
            <Reanimated.View
              key={recentPhoto} // Force new component instance
              style={[styles.cameraRollPreviewContainer, animatedPhotoStyle]}
            >
              <Image source={{ uri: recentPhoto }} style={styles.cameraRollPreview} />
            </Reanimated.View>
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
    backgroundColor: colors.human.black,
  },
  cameraContainer: {
    ...globalStyles.flex1,
    ...globalStyles.relative,
  },
  errorText: {
    ...globalStyles.center,
    color: colors.human.white,
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
    backgroundColor: colors.semantic.error,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.human.white,
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
    backgroundColor: colors.human.transparent,
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
  cameraSuspendedIndicator: {
    ...globalStyles.absolute,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }],
    backgroundColor: colors.human.semiTransparent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    zIndex: 15,
  },
  cameraSuspendedText: {
    color: colors.human.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
