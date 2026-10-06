import { requestCameraRollHeadRefresh } from '@features/Lens/Camera/cameraRollPhotos/refreshCameraRollHead';
import { useCameraSurface } from '@features/Lens/Camera/CameraSurfaceContext';
import { useCameraRoll } from '@features/Lens/Camera/hooks/useCameraRoll';
import { flashModeOptions } from '@features/Lens/Camera/options';
import type { LensPhotoCaptureContext } from '@features/Lens/ColorPalette/types';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import { Image } from 'expo-image';
import { createAssetAsync, type Asset } from 'expo-media-library';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { FlashMode, Recorder } from 'react-native-vision-camera';

interface CameraBottomControlsProps {
  enableVideoLongPress?: boolean;
  onPhotoCaptureStart?: () => LensPhotoCaptureContext | undefined;
  processPhotoPath?: (inputPath: string) => Promise<string>;
  onPhotoAssetSaved?: (asset: Asset, context?: LensPhotoCaptureContext) => Promise<void>;
  onVideoAssetSaved?: (asset: Asset) => Promise<void>;
}

const identityPhotoPath = (inputPath: string) => Promise.resolve(inputPath);

export const CameraBottomControls = memo(function CameraBottomControls({
  enableVideoLongPress = false,
  onPhotoCaptureStart,
  processPhotoPath = identityPhotoPath,
  onPhotoAssetSaved,
  onVideoAssetSaved,
}: CameraBottomControlsProps) {
  const insets = useSafeAreaInsets();
  const { photoOutput, videoOutput, flashMode } = useCameraSurface();
  const recorderRef = useRef<Recorder | null>(null);

  const {
    animatedPhotoStyle,
    handleCameraRollPress,
    handleCameraRollLongPress,
    fetchRecentMedia,
    recentMedia: recentPhoto,
  } = useCameraRoll();

  const [isRecording, setIsRecording] = useState(false);

  const notifyAfterMediaCapture = useCallback(() => {
    fetchRecentMedia();
    requestCameraRollHeadRefresh();
  }, [fetchRecentMedia]);

  useEffect(() => {
    fetchRecentMedia();
  }, [fetchRecentMedia]);

  const handlePhotoCapture = useCallback(async () => {
    try {
      const captureContext = onPhotoCaptureStart?.();
      const photoFile = await photoOutput.capturePhotoToFile(
        {
          flashMode: flashModeOptions[flashMode].value as FlashMode,
          enableShutterSound: true,
        },
        {}
      );
      const savePath = await processPhotoPath(photoFile.filePath);
      const asset = await createAssetAsync(savePath);
      await onPhotoAssetSaved?.(asset, captureContext);
      notifyAfterMediaCapture();
    } catch {
      Alert.alert('Error', 'Failed to capture');
    }
  }, [
    photoOutput,
    flashMode,
    onPhotoCaptureStart,
    processPhotoPath,
    onPhotoAssetSaved,
    notifyAfterMediaCapture,
  ]);

  const handleVideoCapture = useCallback(async () => {
    try {
      const recorder = await videoOutput.createRecorder({});
      recorderRef.current = recorder;
      await recorder.startRecording(
        async filePath => {
          try {
            const asset = await createAssetAsync(filePath);
            await onVideoAssetSaved?.(asset);
            notifyAfterMediaCapture();
          } catch {
            Alert.alert('Error', 'Failed to capture');
          } finally {
            recorderRef.current = null;
            setIsRecording(false);
          }
        },
        error => {
          Alert.alert('Recording error', error.message);
          recorderRef.current = null;
          setIsRecording(false);
        }
      );
      setIsRecording(true);
    } catch {
      Alert.alert('Error', 'Failed to record video');
    }
  }, [videoOutput, onVideoAssetSaved, notifyAfterMediaCapture]);

  const handleStopRecording = useCallback(async () => {
    const recorder = recorderRef.current;
    if (recorder === null) return;
    await recorder.stopRecording();
  }, []);

  const handleCapturePress = useCallback(() => {
    if (isRecording) {
      void handleStopRecording();
      return;
    }
    void handlePhotoCapture();
  }, [isRecording, handleStopRecording, handlePhotoCapture]);

  const handleCaptureLongPress = useCallback(() => {
    if (isRecording) {
      void handleStopRecording();
      return;
    }
    if (enableVideoLongPress) {
      void handleVideoCapture();
    }
  }, [isRecording, enableVideoLongPress, handleStopRecording, handleVideoCapture]);

  const containerStyle = useMemo(
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
    <View style={containerStyle}>
      <TouchableOpacity
        testID="lens-camera-roll-open"
        style={styles.cameraRollButton}
        onPress={handleCameraRollPress}
        onLongPress={recentPhoto ? handleCameraRollLongPress : undefined}
      >
        {recentPhoto ? (
          <Reanimated.View key={recentPhoto} style={cameraRollPreviewContainerStyle}>
            <Image source={cameraRollSource} style={styles.cameraRollPreview} />
          </Reanimated.View>
        ) : (
          <Text style={styles.cameraRollIcon}>📷</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        testID="lens-capture-button"
        style={captureButtonStyle}
        onPress={handleCapturePress}
        onLongPress={enableVideoLongPress || isRecording ? handleCaptureLongPress : undefined}
      >
        <View style={styles.captureButtonInner} />
      </TouchableOpacity>

      <View style={styles.bottomStub} />
    </View>
  );
});

const styles = StyleSheet.create({
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
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: colors.human.transparent,
    ...globalStyles.flexCenter,
    borderWidth: 2,
    borderColor: colors.human.white,
  },
  captureButtonRecording: {
    backgroundColor: colors.semantic.error,
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: colors.human.white,
  },
  cameraRollButton: {
    width: 70,
    height: 70,
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
});
