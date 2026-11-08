import { IconSymbol } from '@components/shared/icon-symbol/IconSymbol';
import {
  colorLensModeOptions,
  isColorLensDominant,
  type ColorLensMode,
} from '@features/Lens/ColorPalette/colorLensMode';
import { ColorPalette } from '@features/Lens/ColorPalette/ColorPalette';
import { useColorLensPalette } from '@features/Lens/ColorPalette/useColorLensPalette';
import { OBSKURA_COLOR_MODE, type ObskuraColorMode } from '@features/Lens/Obskura/options';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import { memo, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraSurface } from './CameraSurfaceContext';
import {
  CAMERA_VIEW_MODE,
  cameraDeviceOptions,
  flashModeOptions,
  gridModeOptions,
} from './options';

interface CameraTopControlsProps {
  isFrozen?: boolean;
  colorLensMode?: ColorLensMode;
  palette?: ReturnType<typeof useColorLensPalette>['palette'];
  colorAnimationDuration?: number;
  onColorLensModeToggle?: () => void;
  obskuraColorMode?: ObskuraColorMode;
  onObskuraColorModeToggle?: () => void;
}

export const CameraTopControls = memo(function CameraTopControls({
  isFrozen = false,
  colorLensMode,
  palette,
  colorAnimationDuration,
  onColorLensModeToggle,
  obskuraColorMode,
  onObskuraColorModeToggle,
}: CameraTopControlsProps) {
  const insets = useSafeAreaInsets();
  const {
    cameraViewMode,
    flashMode,
    gridMode,
    onViewModeToggle,
    onGridToggle,
    onFlashToggle,
    onSwitchCameraToggle,
    onCameraDeviceToggle,
  } = useCameraSurface();
  const showCameraDeviceToggle = cameraDeviceOptions.length > 1;
  const showColorLensControls = colorLensMode !== undefined && onColorLensModeToggle !== undefined;
  const showObskuraColorModeControls =
    obskuraColorMode !== undefined && onObskuraColorModeToggle !== undefined;
  const viewModeIcon = cameraViewMode === CAMERA_VIEW_MODE.OBSKURA ? 'camera.fill' : 'drop.fill';
  const iconColor = isFrozen ? (colors.gray[400] as string) : colors.human.white;
  const buttonStyle = useMemo(
    () => [styles.topButton, isFrozen && styles.topButtonDisabled],
    [isFrozen]
  );

  const containerStyle = useMemo(
    () => [styles.topControls, { top: insets.top + 40 }],
    [insets.top]
  );

  return (
    <View
      style={containerStyle}
      // Swallow taps on the chrome column so they never reach the viewport freeze/focus gesture.
      onStartShouldSetResponder={() => true}
    >
      <TouchableOpacity
        testID="lens-control-view-mode"
        style={buttonStyle}
        onPress={onViewModeToggle}
        disabled={isFrozen}
        accessibilityState={{ disabled: isFrozen }}
      >
        <IconSymbol size={globalStyles.symbolSize} color={iconColor} name={viewModeIcon} />
      </TouchableOpacity>
      <TouchableOpacity
        testID="lens-control-grid"
        style={buttonStyle}
        onPress={onGridToggle}
        disabled={isFrozen}
        accessibilityState={{ disabled: isFrozen }}
      >
        <IconSymbol
          size={globalStyles.symbolSize}
          color={iconColor}
          name={gridModeOptions[gridMode].icon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        testID="lens-control-flash"
        style={buttonStyle}
        onPress={onFlashToggle}
        disabled={isFrozen}
        accessibilityState={{ disabled: isFrozen }}
      >
        <IconSymbol
          size={globalStyles.symbolSize}
          color={iconColor}
          name={flashModeOptions[flashMode].icon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        testID="lens-control-flip-camera"
        style={buttonStyle}
        onPress={onSwitchCameraToggle}
        disabled={isFrozen}
        accessibilityState={{ disabled: isFrozen }}
      >
        <IconSymbol
          size={globalStyles.symbolSize}
          color={iconColor}
          name="arrow.trianglehead.2.clockwise.rotate.90.circle"
        />
      </TouchableOpacity>
      {showCameraDeviceToggle && (
        <TouchableOpacity
          testID="lens-control-lens-device"
          style={buttonStyle}
          onPress={onCameraDeviceToggle}
          disabled={isFrozen}
          accessibilityState={{ disabled: isFrozen }}
          accessibilityLabel="Switch lens configuration"
        >
          <IconSymbol
            size={globalStyles.symbolSize}
            color={iconColor}
            name="camera.aperture"
          />
        </TouchableOpacity>
      )}
      {showColorLensControls && (
        <>
          <TouchableOpacity
            testID="lens-toggle-color-lens"
            style={buttonStyle}
            onPress={onColorLensModeToggle}
            disabled={isFrozen}
            accessibilityState={{ disabled: isFrozen }}
          >
            <IconSymbol
              size={globalStyles.symbolSize}
              color={iconColor}
              name={colorLensModeOptions[colorLensMode].icon}
            />
          </TouchableOpacity>
          {isColorLensDominant(colorLensMode) &&
            palette !== undefined &&
            colorAnimationDuration !== undefined && (
              <ColorPalette
                palette={palette}
                animationDuration={colorAnimationDuration}
                style={styles.colorPaletteContainer}
              />
            )}
        </>
      )}
      {showObskuraColorModeControls && (
        <TouchableOpacity
          testID="lens-control-obskura-color-mode"
          style={buttonStyle}
          onPress={onObskuraColorModeToggle}
          disabled={isFrozen}
          accessibilityState={{ disabled: isFrozen }}
        >
          <IconSymbol
            size={globalStyles.symbolSize}
            color={iconColor}
            name={obskuraColorMode === OBSKURA_COLOR_MODE.DEFAULT ? 'sun.max.fill' : 'moon.fill'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  topControls: {
    ...globalStyles.absolute,
    right: 0,
    ...globalStyles.flex1,
    gap: 0,
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
  topButtonDisabled: {
    opacity: 0.45,
  },
  colorPaletteContainer: {
    paddingBottom: spacing.md,
  },
});
