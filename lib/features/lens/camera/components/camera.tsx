import { IconSymbol, ThemedText } from '@components/shared';
import { ColorPalette, LensPalette, useColorLensPalette } from '@features/lens/lens-palette';
import { useLens } from '@platform';
import { colors, globalStyles, spacing } from '@styles';
import { Image } from 'expo-image';
import { createAssetAsync } from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CameraPosition,
  useCameraDevice,
  useFrameProcessor,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import {
  calculateFps,
  CAMERA_MODE,
  CAMERA_POSITION,
  cameraDeviceOptions,
  CameraMode,
  flashModeOptions,
  gridModeOptions,
} from '../camera-options';
import { useCameraFocus, useCameraRoll, useLensPermissions } from '../hooks';
import { CameraGrid } from './camera-grid';

const flashModeOptionsLength = flashModeOptions.length;
const cameraDeviceOptionsLength = cameraDeviceOptions.length;
const controlSymbolSize = 30;

const ReanimatedCamera = Reanimated.createAnimatedComponent(VisionCamera);
Reanimated.addWhitelistedNativeProps({
  isActive: true,
});

export const Camera = () => {
  const { onAddLensPalette } = useLens();
  const { cameraPermission, mediaLibraryPermission, microphonePermission } = useLensPermissions();
  const insets = useSafeAreaInsets();

  // State management
  const [cameraDevice, setCameraDevice] = useState<number>(0);
  const [cameraMode, setCameraMode] = useState<CameraMode>(CAMERA_MODE.PHOTO);
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>(CAMERA_POSITION.BACK);
  const [flashMode, setFlashMode] = useState<number>(0);
  const [gridMode, setGridMode] = useState<number>(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const device = useCameraDevice(cameraPosition, {
    physicalDevices: cameraDeviceOptions[cameraDevice].value,
  });

  const camera = useRef<VisionCamera>(null);

  const { handleFocusTap, focusIndicatorAnimatedStyle } = useCameraFocus(camera);

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
  const isVideoNotAllowed = isColorLensEnabled;

  const fps = useMemo(
    () => calculateFps({ isColorLensEnabled, isCameraActive }),
    [isColorLensEnabled, isCameraActive]
  );

  const colorAnimationDuration = useMemo(() => (1 / fps) * 1000, [fps]);

  const handleVideoCapture = useCallback(async () => {
    if (!camera.current) return;

    try {
      camera.current.startRecording({
        onRecordingFinished: async video => {
          await createAssetAsync(video.path);
          fetchRecentMedia();
        },
        onRecordingError: error => {
          Alert.alert('Recording error', error.message);
        },
      });
      setIsRecording(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to record video');
    }
  }, [fetchRecentMedia]);

  const handleCapture = useCallback(async () => {
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
      });

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

      fetchRecentMedia();
    } catch (error) {
      Alert.alert('Error', 'Failed to capture');
    }
  }, [palette, flashMode, onAddLensPalette, fetchRecentMedia]);

  const handleStopRecording = useCallback(async () => {
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

  const handleEnableColorLensToggle = useCallback(() => setIsColorLensEnabled(prev => !prev), []);

  const handleBackPress = useCallback(() => router.back(), []);

  // Fetch recent photo when permissions are granted
  useEffect(() => {
    if (mediaLibraryPermission) {
      fetchRecentMedia();
    }
  }, [mediaLibraryPermission]);

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

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (!isCameraActive) return;

      // const data = scanImage(frame);
      // console.log(data, 'data');
      if (isColorLensEnabled) {
        getColorLensPaletteWorklet(frame);
      }
    },
    [isCameraActive, isColorLensEnabled]
  );

  return (
    <View style={styles.container}>
      {/* Camera view */}
      <View style={styles.cameraContainer}>
        {device && hasAllPermissions ? (
          <GestureDetector gesture={gesture}>
            <View style={styles.cameraInnerContainer}>
              <ReanimatedCamera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isCameraActive}
                photo
                video
                audio
                frameProcessor={isCameraActive ? frameProcessor : undefined}
                fps={fps}
              />
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
          style={[styles.backButton, { top: insets.top }]}
          onPress={handleBackPress}
        >
          <IconSymbol size={controlSymbolSize} color={colors.human.white} name="chevron.left" />
        </TouchableOpacity>
      </View>

      {/* ===== TOP CONTROLS SECTION ===== */}
      <View style={[styles.topControls, { top: insets.top + 60 }]}>
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
            <Text style={styles.topButtonIcon}>💿</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.topButton} onPress={handleEnableColorLensToggle}>
          <IconSymbol
            size={controlSymbolSize}
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
      </View>

      {/* ===== BOTTOM CONTROLS SECTION ===== */}
      <View style={[styles.bottomControls, { bottom: insets.bottom + 40 }]}>
        {/* Camera Roll Button */}
        <TouchableOpacity style={styles.cameraRollButton} onPress={handleCameraRollPress}>
          {recentPhoto ? (
            <Reanimated.View
              key={recentPhoto}
              style={[styles.cameraRollPreviewContainer, animatedPhotoStyle]}
            >
              <Image source={{ uri: recentPhoto }} style={styles.cameraRollPreview} />
            </Reanimated.View>
          ) : (
            <Text style={styles.cameraRollIcon}>📷</Text>
          )}
        </TouchableOpacity>

        {/* Capture Button */}
        <TouchableOpacity
          style={[styles.captureButton, isRecording && styles.captureButtonRecording]}
          {...triggerProps}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <View style={styles.bottomStub} />
      </View>
    </View>
  );
};

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
