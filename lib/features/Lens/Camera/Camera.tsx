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
import { CameraGrid } from './CameraGrid';
import { CameraSurfaceProvider, useCameraSurface } from './CameraSurfaceContext';
import { useCameraFocus } from './hooks/useCameraFocus';
import { LensCameraSurface } from './LensCameraSurface';
import { CAMERA_VIEW_MODE, gridModeOptions } from './options';

const CameraViewport = memo(function CameraViewport() {
  const { showPreview, gridMode, cameraViewMode } = useCameraSurface();
  const showGrid = gridModeOptions[gridMode].value === 'on';
  const isLensMode = cameraViewMode === CAMERA_VIEW_MODE.LENS;

  return (
    <View style={styles.cameraInnerContainer}>
      {isLensMode ? <LensCameraSurface /> : <ObskuraCameraSurface />}
      {!showPreview && (
        <ThemedText style={styles.errorOverlay} accessibilityRole="text">
          No camera available
        </ThemedText>
      )}
      {showGrid && <CameraGrid />}
    </View>
  );
});

const CameraContent = memo(function CameraContent() {
  const insets = useSafeAreaInsets();
  const { cameraRef, showPreview } = useCameraSurface();
  const { handleFocusTap } = useCameraFocus(cameraRef);

  const handleBackPress = useCallback(() => router.back(), []);

  const gesture = useMemo(
    /* istanbul ignore next -- Gesture onEnd + runOnJS not executed under Jest RNGH/Reanimated mocks */
    () =>
      Gesture.Tap().onEnd(({ x, y }) => {
        runOnJS(handleFocusTap)(x, y);
      }),
    [handleFocusTap]
  );

  const backButtonStyle = useMemo(() => [styles.backButton, { top: insets.top }], [insets.top]);

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        {showPreview ? (
          <GestureDetector gesture={gesture}>
            <View collapsable={false} style={globalStyles.flex1}>
              <CameraViewport />
            </View>
          </GestureDetector>
        ) : (
          <CameraViewport />
        )}

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
    zIndex: 10,
  },
});
