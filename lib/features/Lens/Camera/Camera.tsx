import { IconSymbol } from '@components/shared/icon-symbol/IconSymbol';
import { ThemedText } from '@components/shared/ThemedText';
import { applyObskuraLensToPhotoFile } from '@features/Lens/Obskura/applyObskuraLensToPhotoFile';
import { requestCameraRollHeadRefresh } from '@features/Lens/Camera/cameraRollPhotos/refreshCameraRollHead';
import { OBSKURA_COLOR_MODE, type ObskuraColorMode } from '@features/Lens/Obskura/options';
import { ObskuraCameraSurface } from '@features/Lens/Obskura/ObskuraCameraSurface';
import { ColorPalette } from '@features/Lens/ColorPalette/ColorPalette';
import type { LensPalette } from '@features/Lens/ColorPalette/types';
import { useColorLensPalette } from '@features/Lens/ColorPalette/useColorLensPalette';
import { useLens } from '@platform';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import { Image } from 'expo-image';
import { createAssetAsync } from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CameraPosition,
  useCameraDevice,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import { CameraGrid } from './CameraGrid';
import { useCameraFocus } from './hooks/useCameraFocus';
import { useCameraRoll } from './hooks/useCameraRoll';
import { useLensPermissions } from './hooks/useLensPermissions';
import { LensCameraSurface } from './LensCameraSurface';
import {
  CAMERA_POSITION,
  CAMERA_VIEW_MODE,
  cameraDeviceOptions,
  flashModeOptions,
  gridModeOptions,
  type CameraViewMode,
} from './options';

const flashModeOptionsLength = flashModeOptions.length;
const cameraDeviceOptionsLength = cameraDeviceOptions.length;
/** Obskura blur is GPU-heavy; lower FPS reduces memory pressure and thermal crashes. */
const OBSKURA_FPS = 15;
const COLOR_LENS_FPS = 15;
const DEFAULT_FPS = 30;
/** Swatch blend duration (ms); larger = slower transitions vs camera FPS */
const COLOR_SWATCH_BLEND_MS = 350;
export const Camera = memo(function Camera() {
  const { onAddLensPalette } = useLens();
  const { cameraPermission, mediaLibraryPermission, microphonePermission } = useLensPermissions();
  const insets = useSafeAreaInsets();

  // State management
  const [cameraDevice, setCameraDevice] = useState<number>(0);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(CAMERA_POSITION.BACK);
  const [cameraViewMode, setCameraViewMode] = useState<CameraViewMode>(CAMERA_VIEW_MODE.LENS);
  const [obskuraColorMode, setObskuraColorMode] = useState<ObskuraColorMode>(
    OBSKURA_COLOR_MODE.DEFAULT
  );
  const [flashMode, setFlashMode] = useState<number>(0);
  const [gridMode, setGridMode] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const device = useCameraDevice(cameraPosition, {
    physicalDevices: cameraDeviceOptions[cameraDevice].value,
  });

  const camera = useRef<VisionCamera>(null);

  const { handleFocusTap } = useCameraFocus(camera);

  const hasAllPermissions = cameraPermission && microphonePermission && mediaLibraryPermission;

  const {
    animatedPhotoStyle,
    handleCameraRollPress,
    fetchRecentMedia: fetchRecentMedia,
    recentMedia: recentPhoto,
  } = useCameraRoll(hasAllPermissions);
  const { isColorLensEnabled, setIsColorLensEnabled, palette, getColorLensPaletteWorklet } =
    useColorLensPalette();

  const showGrid = gridModeOptions[gridMode].value === 'on';
  const isLensMode = cameraViewMode === CAMERA_VIEW_MODE.LENS;
  const isObskuraMode = cameraViewMode === CAMERA_VIEW_MODE.OBSKURA;
  const isVideoNotAllowed = isColorLensEnabled || isObskuraMode;

  const fps = isCameraActive && isColorLensEnabled ? COLOR_LENS_FPS : DEFAULT_FPS;

  const colorAnimationDuration = 500;

  const handleVideoCapture = useCallback(async () => {
    /* istanbul ignore next -- ref is set when capture is reachable in production */
    if (!camera.current) return;

    try {
      camera.current.startRecording({
        onRecordingFinished: async video => {
          await createAssetAsync(video.path);
          await fetchRecentMedia();
          requestCameraRollHeadRefresh();
        },
        onRecordingError: error => {
          Alert.alert('Recording error', error.message);
        },
      });
      setIsRecording(true);
    } catch {
      Alert.alert('Error', 'Failed to record video');
    }
  }, [fetchRecentMedia]);

  const handleCapture = useCallback(async () => {
    /* istanbul ignore next -- ref is set when capture is reachable in production */
    if (!camera.current) return;

    try {
      const currentPalette = {
        primaryColor: palette.primaryColor.value,
        secondaryColor: palette.secondaryColor.value,
        tertiaryColor: palette.tertiaryColor.value,
        quaternaryColor: palette.quaternaryColor.value,
        quinaryColor: palette.quinaryColor.value,
        senaryColor: palette.senaryColor.value,
        backgroundColor: palette.backgroundColor.value,
        detailColor: palette.detailColor.value,
      };

      const photo = await camera.current.takePhoto({
        flash: flashModeOptions[flashMode].value,
        enableShutterSound: true,
      });

      if (isObskuraMode) {
        const paintedUri = await applyObskuraLensToPhotoFile({
          inputPath: photo.path,
          colorMode: obskuraColorMode,
        });
        await createAssetAsync(paintedUri);
      } else {
        const asset = await createAssetAsync(photo.path);

        if (isColorLensEnabled) {
          const lensPalette: LensPalette = {
            id: asset.id,
            uri: asset.uri,
            mediaType: asset.mediaType,
            palette: currentPalette,
          };
          onAddLensPalette(lensPalette);
          console.log('asset lens palette: ', lensPalette);
        }
      }

      fetchRecentMedia();
      requestCameraRollHeadRefresh();
    } catch {
      Alert.alert('Error', 'Failed to capture');
    }
  }, [
    palette,
    flashMode,
    onAddLensPalette,
    fetchRecentMedia,
    isColorLensEnabled,
    isObskuraMode,
    obskuraColorMode,
  ]);

  const handleStopRecording = useCallback(async () => {
    /* istanbul ignore next -- ref is always set when stop is reachable in production */
    if (!camera.current) return;
    await camera.current.stopRecording();
    setIsRecording(false);
  }, []);

  const handleFlashToggle = useCallback(() => {
    setFlashMode(prev => (prev + 1) % flashModeOptionsLength);
  }, []);

  const handleGridToggle = useCallback(() => {
    setGridMode(prev => (prev + 1) % gridModeOptions.length);
  }, []);

  const handleSwitchCameraToggle = useCallback(() => {
    setCameraPosition(prev =>
      prev === CAMERA_POSITION.BACK ? CAMERA_POSITION.FRONT : CAMERA_POSITION.BACK
    );
  }, []);

  const handleCameraDeviceToggle = useCallback(() => {
    setCameraDevice(prev => (prev + 1) % cameraDeviceOptionsLength);
  }, []);

  const handleCameraViewModeToggle = useCallback(() => {
    setCameraViewMode(prev =>
      prev === CAMERA_VIEW_MODE.LENS ? CAMERA_VIEW_MODE.OBSKURA : CAMERA_VIEW_MODE.LENS
    );
  }, []);

  const handleObskuraColorModeToggle = useCallback(() => {
    setObskuraColorMode(prev =>
      prev === OBSKURA_COLOR_MODE.DEFAULT
        ? OBSKURA_COLOR_MODE.TAME_RED
        : OBSKURA_COLOR_MODE.DEFAULT
    );
  }, []);

  const handleEnableColorLensToggle = useCallback(() => setIsColorLensEnabled(prev => !prev), []);

  const handleBackPress = useCallback(() => router.back(), []);

  // Fetch recent photo when permissions are granted
  useEffect(() => {
    if (mediaLibraryPermission) {
      fetchRecentMedia();
    }
  }, [fetchRecentMedia, mediaLibraryPermission]);

  // Camera suspension logic - suspend when screen loses focus
  useFocusEffect(
    useCallback(() => {
      setIsCameraActive(true);

      return () => {
        console.log('camera suspended');
        setIsCameraActive(false);
      };
    }, [])
  );

  const gesture = useMemo(
    /* istanbul ignore next -- Gesture onEnd + runOnJS not executed under Jest RNGH/Reanimated mocks */
    () =>
      Gesture.Tap().onEnd(({ x, y }) => {
        runOnJS(handleFocusTap)(x, y);
      }),
    [handleFocusTap]
  );

  const triggerProps = useMemo(
    () =>
      isRecording
        ? {
            onPress: handleStopRecording,
            onLongPress: handleStopRecording,
          }
        : {
            onPress: handleCapture,
            onLongPress: isVideoNotAllowed ? undefined : handleVideoCapture,
          },
    [isVideoNotAllowed, isRecording, handleCapture, handleStopRecording, handleVideoCapture]
  );
  const backButtonStyle = useMemo(() => [styles.backButton, { top: insets.top }], [insets.top]);
  const topControlsStyle = useMemo(
    () => [styles.topControls, { top: insets.top + 60 }],
    [insets.top]
  );
  const bottomControlsStyle = useMemo(
    () => [styles.bottomControls, { bottom: insets.bottom + 40 }],
    [insets.bottom]
  );
  const cameraRollPreviewContainerStyle = useMemo(
    () => [styles.cameraRollPreviewContainer, animatedPhotoStyle],
    [animatedPhotoStyle]
  );
  const cameraRollSource = useMemo(
    () => (recentPhoto ? { uri: recentPhoto } : undefined),
    [recentPhoto]
  );
  const captureButtonStyle = useMemo(
    () => [styles.captureButton, isRecording && styles.captureButtonRecording],
    [isRecording]
  );

  return (
    <View style={styles.container}>
      {/* Camera view */}
      <View style={styles.cameraContainer}>
        {device && hasAllPermissions ? (
          <GestureDetector gesture={gesture}>
            <View style={styles.cameraInnerContainer}>
              {isLensMode ? (
                <LensCameraSurface
                  cameraRef={camera}
                  device={device}
                  isActive={isCameraActive}
                  fps={fps}
                  isColorLensEnabled={isColorLensEnabled}
                  getColorLensPaletteWorklet={getColorLensPaletteWorklet}
                />
              ) : (
                <ObskuraCameraSurface
                  cameraRef={camera}
                  device={device}
                  isActive={isCameraActive}
                  fps={OBSKURA_FPS}
                  colorMode={obskuraColorMode}
                />
              )}
              {/* ===== GRID OVERLAY SECTION ===== */}
              {showGrid && <CameraGrid />}
            </View>
          </GestureDetector>
        ) : (
          <View style={styles.cameraInnerContainer}>
            <ThemedText style={styles.errorText}>
              {!device ? 'No camera available' : 'Camera permission required'}
            </ThemedText>

            {showGrid && <CameraGrid />}
          </View>
        )}

        {/* ===== BACK BUTTON SECTION ===== */}
        <TouchableOpacity
          testID="lens-back-button"
          style={backButtonStyle}
          onPress={handleBackPress}
        >
          <IconSymbol
            size={globalStyles.symbolSize}
            color={colors.human.white}
            name="chevron.left"
          />
        </TouchableOpacity>
      </View>

      {/* ===== TOP CONTROLS SECTION ===== */}
      <View style={topControlsStyle}>
        <TouchableOpacity
          testID="lens-control-view-mode"
          style={styles.topButton}
          onPress={handleCameraViewModeToggle}
        >
          <IconSymbol
            size={globalStyles.symbolSize}
            color={colors.human.white}
            name={isLensMode ? 'drop.fill' : 'camera.fill'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          testID="lens-control-grid"
          style={styles.topButton}
          onPress={handleGridToggle}
        >
          <IconSymbol
            size={globalStyles.symbolSize}
            color={colors.human.white}
            name={gridModeOptions[gridMode].icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          testID="lens-control-flash"
          style={styles.topButton}
          onPress={handleFlashToggle}
        >
          <IconSymbol
            size={globalStyles.symbolSize}
            color={colors.human.white}
            name={flashModeOptions[flashMode].icon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          testID="lens-control-flip-camera"
          style={styles.topButton}
          onPress={handleSwitchCameraToggle}
        >
          <IconSymbol
            size={globalStyles.symbolSize}
            color={colors.human.white}
            name="arrow.trianglehead.2.clockwise.rotate.90.circle"
          />
        </TouchableOpacity>
        {cameraDeviceOptionsLength > 1 && (
          <TouchableOpacity
            testID="lens-control-lens-device"
            style={styles.topButton}
            onPress={handleCameraDeviceToggle}
            accessibilityLabel="Switch lens configuration"
          >
            <IconSymbol
              size={globalStyles.symbolSize}
              color={colors.human.white}
              name="camera.aperture"
            />
          </TouchableOpacity>
        )}

        {isLensMode && (
          <>
            <TouchableOpacity
              testID="lens-toggle-color-lens"
              style={styles.topButton}
              onPress={handleEnableColorLensToggle}
            >
              <IconSymbol
                size={globalStyles.symbolSize}
                color={colors.human.white}
                name="swatchpalette.fill"
              />
            </TouchableOpacity>
            {isColorLensEnabled && (
              <ColorPalette
                palette={palette}
                animationDuration={colorAnimationDuration}
                style={styles.colorPaletteContainer}
              />
            )}
          </>
        )}

        {isObskuraMode && (
          <TouchableOpacity
            testID="lens-control-obskura-color-mode"
            style={styles.topButton}
            onPress={handleObskuraColorModeToggle}
          >
            <IconSymbol
              size={globalStyles.symbolSize}
              color={colors.human.white}
              name={
                obskuraColorMode === OBSKURA_COLOR_MODE.DEFAULT ? 'sun.max.fill' : 'moon.fill'
              }
            />
          </TouchableOpacity>
        )}
      </View>

      {/* ===== BOTTOM CONTROLS SECTION ===== */}
      <View style={bottomControlsStyle}>
        {/* Camera Roll Button */}
        <TouchableOpacity
          testID="lens-camera-roll-open"
          style={styles.cameraRollButton}
          onPress={handleCameraRollPress}
        >
          {recentPhoto ? (
            <Reanimated.View key={recentPhoto} style={cameraRollPreviewContainerStyle}>
              <Image source={cameraRollSource} style={styles.cameraRollPreview} />
            </Reanimated.View>
          ) : (
            <Text style={styles.cameraRollIcon}>📷</Text>
          )}
        </TouchableOpacity>

        {/* Capture Button */}
        <TouchableOpacity testID="lens-capture-button" style={captureButtonStyle} {...triggerProps}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <View style={styles.bottomStub} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
    backgroundColor: colors.human.black,
  },
  cameraContainer: {
    ...globalStyles.flex1,
    ...globalStyles.relative,
  },
  cameraInnerContainer: {
    ...globalStyles.flex1,
  },
  errorText: {
    ...globalStyles.flexCenter,
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
    ...globalStyles.flexCenter,
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
    ...globalStyles.flexCenter,
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
  colorPaletteContainer: {
    paddingBottom: spacing.md,
  },
});
