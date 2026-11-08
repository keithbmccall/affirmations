import { IconSymbol } from '@components/shared/icon-symbol/IconSymbol';
import { ThemedText } from '@components/shared/ThemedText';
import { ObskuraCameraSurface } from '@features/Lens/Obskura/ObskuraCameraSurface';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import { router } from 'expo-router';
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraBottomControls } from './CameraBottomControls';
import { CameraGrid } from './CameraGrid';
import { CameraSurfaceProvider, useCameraSurface } from './CameraSurfaceContext';
import { CameraTopControls } from './CameraTopControls';
import { useCameraFocus } from './hooks/useCameraFocus';
import { LensCameraSurface } from './LensCameraSurface';
import { CAMERA_VIEW_MODE, gridModeOptions } from './options';

interface CameraViewportProps {
  onViewportTap: (x: number, y: number) => void;
  enableViewportTap: boolean;
}

const CameraViewport = memo(function CameraViewport({
  onViewportTap,
  enableViewportTap,
}: CameraViewportProps) {
  const { showPreview, gridMode, cameraViewMode, chromeBindings } = useCameraSurface();
  const showGrid = gridModeOptions[gridMode].value === 'on';
  const isLensMode = cameraViewMode === CAMERA_VIEW_MODE.LENS;

  const gesture = useMemo(
    /* istanbul ignore next -- Gesture onEnd + runOnJS not executed under Jest RNGH/Reanimated mocks */
    () =>
      Gesture.Tap().onEnd(({ x, y }) => {
        runOnJS(onViewportTap)(x, y);
      }),
    [onViewportTap]
  );

  const preview = (
    <View collapsable={false} style={globalStyles.flex1}>
      {isLensMode ? <LensCameraSurface /> : <ObskuraCameraSurface />}
      {!showPreview && (
        <ThemedText style={styles.errorOverlay} accessibilityRole="text">
          No camera available
        </ThemedText>
      )}
      {showGrid && <CameraGrid />}
    </View>
  );

  return (
    <View style={styles.cameraInnerContainer}>
      {enableViewportTap ? <GestureDetector gesture={gesture}>{preview}</GestureDetector> : preview}
      <CameraTopControls
        isFrozen={chromeBindings?.isFrozen}
        colorLensMode={chromeBindings?.colorLensMode}
        palette={chromeBindings?.palette}
        colorAnimationDuration={chromeBindings?.colorAnimationDuration}
        onColorLensModeToggle={chromeBindings?.onColorLensModeToggle}
        obskuraColorMode={chromeBindings?.obskuraColorMode}
        onObskuraColorModeToggle={chromeBindings?.onObskuraColorModeToggle}
      />
      <CameraBottomControls
        photoOutput={chromeBindings?.photoOutput}
        videoOutput={chromeBindings?.videoOutput}
        enableVideoLongPress={chromeBindings?.enableVideoLongPress}
        isFrozen={chromeBindings?.isFrozen}
        onFreezeToggle={chromeBindings?.onFreezeToggle}
        onPhotoCaptureStart={chromeBindings?.onPhotoCaptureStart}
        processPhotoPath={chromeBindings?.processPhotoPath}
        onPhotoAssetSaved={chromeBindings?.onPhotoAssetSaved}
        onVideoAssetSaved={chromeBindings?.onVideoAssetSaved}
      />
    </View>
  );
});

const CameraContent = memo(function CameraContent() {
  const insets = useSafeAreaInsets();
  const { cameraRef, showPreview, chromeBindings } = useCameraSurface();
  const { handleFocusTap } = useCameraFocus(cameraRef);

  const handleBackPress = useCallback(() => router.back(), []);

  const handleViewportTap = useCallback(
    (x: number, y: number) => {
      if (chromeBindings?.isFrozen === true && chromeBindings.onFrozenTap !== undefined) {
        chromeBindings.onFrozenTap(x, y);
        return;
      }
      handleFocusTap(x, y);
    },
    [chromeBindings, handleFocusTap]
  );

  const backButtonStyle = useMemo(() => [styles.backButton, { top: insets.top }], [insets.top]);

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraViewport onViewportTap={handleViewportTap} enableViewportTap={showPreview} />

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
    </View>
  );
});

export const Camera = memo(function Camera() {
  return (
    <CameraSurfaceProvider>
      <CameraContent />
    </CameraSurfaceProvider>
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
    ...globalStyles.relative,
  },
  errorOverlay: {
    ...globalStyles.absoluteFill,
    ...globalStyles.flexCenter,
    color: colors.human.white,
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
    // Above viewport chrome (top/bottom controls use zIndex 10).
    zIndex: 20,
  },
});
