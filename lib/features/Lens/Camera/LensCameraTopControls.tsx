import { IconSymbol } from '@components/shared/icon-symbol/IconSymbol';
import {
  colorLensModeOptions,
  isColorLensDominant,
  type ColorLensMode,
} from '@features/Lens/ColorPalette/colorLensMode';
import { ColorPalette } from '@features/Lens/ColorPalette/ColorPalette';
import { useColorLensPalette } from '@features/Lens/ColorPalette/useColorLensPalette';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cameraTopControlsStyles as styles } from './cameraTopControlsStyles';
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

  return (
    <View style={[styles.topControls, { top: insets.top + 60 }]}>
      <TouchableOpacity
        testID="lens-control-view-mode"
        style={styles.topButton}
        onPress={onViewModeToggle}
      >
        <IconSymbol size={globalStyles.symbolSize} color={colors.human.white} name="drop.fill" />
      </TouchableOpacity>
      <TouchableOpacity testID="lens-control-grid" style={styles.topButton} onPress={onGridToggle}>
        <IconSymbol
          size={globalStyles.symbolSize}
          color={colors.human.white}
          name={gridModeOptions[gridMode].icon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        testID="lens-control-flash"
        style={styles.topButton}
        onPress={onFlashToggle}
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
          name={colorLensModeOptions[colorLensMode].icon}
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
