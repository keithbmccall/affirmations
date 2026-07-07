import { IconSymbol } from '@components/shared/icon-symbol/IconSymbol';
import {
  isColorLensDominant,
  isColorLensPoint,
  type ColorLensMode,
} from '@features/Lens/ColorPalette/colorLensMode';
import { ColorPalette } from '@features/Lens/ColorPalette/ColorPalette';
import { useColorLensPalette } from '@features/Lens/ColorPalette/useColorLensPalette';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import { memo, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraSurface } from './CameraSurfaceContext';
import { cameraDeviceOptions, flashModeOptions, gridModeOptions } from './options';

interface LensCameraTopControlsProps {
  colorLensMode: ColorLensMode;
  palette: ReturnType<typeof useColorLensPalette>['palette'];
  colorAnimationDuration: number;
  onColorLensModeToggle: () => void;
}

export const LensCameraTopControls = memo(function LensCameraTopControls({
  colorLensMode,
  palette,
  colorAnimationDuration,
  onColorLensModeToggle,
}: LensCameraTopControlsProps) {
  const insets = useSafeAreaInsets();
  const {
    flashMode,
    gridMode,
    onViewModeToggle,
    onGridToggle,
    onFlashToggle,
    onSwitchCameraToggle,
    onCameraDeviceToggle,
  } = useCameraSurface();
  const showCameraDeviceToggle = cameraDeviceOptions.length > 1;

  const containerStyle = useMemo(
    () => [styles.topControls, { top: insets.top + 60 }],
    [insets.top]
  );

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        testID="lens-control-view-mode"
        style={styles.topButton}
        onPress={onViewModeToggle}
      >
        <IconSymbol
          size={globalStyles.symbolSize}
          color={colors.human.white}
          name="drop.fill"
        />
      </TouchableOpacity>
      <TouchableOpacity testID="lens-control-grid" style={styles.topButton} onPress={onGridToggle}>
        <IconSymbol
          size={globalStyles.symbolSize}
          color={colors.human.white}
          name={gridModeOptions[gridMode].icon}
        />
      </TouchableOpacity>
      <TouchableOpacity testID="lens-control-flash" style={styles.topButton} onPress={onFlashToggle}>
        <IconSymbol
          size={globalStyles.symbolSize}
          color={colors.human.white}
          name={flashModeOptions[flashMode].icon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        testID="lens-control-flip-camera"
        style={styles.topButton}
        onPress={onSwitchCameraToggle}
      >
        <IconSymbol
          size={globalStyles.symbolSize}
          color={colors.human.white}
          name="arrow.trianglehead.2.clockwise.rotate.90.circle"
        />
      </TouchableOpacity>
      {showCameraDeviceToggle && (
        <TouchableOpacity
          testID="lens-control-lens-device"
          style={styles.topButton}
          onPress={onCameraDeviceToggle}
          accessibilityLabel="Switch lens configuration"
        >
          <IconSymbol
            size={globalStyles.symbolSize}
            color={colors.human.white}
            name="camera.aperture"
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        testID="lens-toggle-color-lens"
        style={styles.topButton}
        onPress={onColorLensModeToggle}
      >
        <IconSymbol
          size={globalStyles.symbolSize}
          color={colors.human.white}
          name={isColorLensPoint(colorLensMode) ? 'scope' : 'swatchpalette.fill'}
        />
      </TouchableOpacity>
      {isColorLensDominant(colorLensMode) && (
        <ColorPalette
          palette={palette}
          animationDuration={colorAnimationDuration}
          style={styles.colorPaletteContainer}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
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
  colorPaletteContainer: {
    paddingBottom: spacing.md,
  },
});
