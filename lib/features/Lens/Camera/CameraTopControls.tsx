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
import { memo, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCameraSurface } from './CameraSurfaceContext';
import { cameraTopControlsStyles as styles } from './cameraTopControlsStyles';
import {
  CAMERA_VIEW_MODE,
  cameraDeviceOptions,
  flashModeOptions,
  gridModeOptions,
} from './options';

interface CameraTopControlsProps {
  colorLensMode?: ColorLensMode;
  palette?: ReturnType<typeof useColorLensPalette>['palette'];
  colorAnimationDuration?: number;
  onColorLensModeToggle?: () => void;
  obskuraColorMode?: ObskuraColorMode;
  onObskuraColorModeToggle?: () => void;
}

export const CameraTopControls = memo(function CameraTopControls({
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
  const showColorLensControls =
    colorLensMode !== undefined && onColorLensModeToggle !== undefined;
  const showObskuraColorModeControls =
    obskuraColorMode !== undefined && onObskuraColorModeToggle !== undefined;
  const viewModeIcon =
    cameraViewMode === CAMERA_VIEW_MODE.OBSKURA ? 'camera.fill' : 'drop.fill';

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
          name={viewModeIcon}
        />
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
      {showColorLensControls && (
        <>
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
          style={styles.topButton}
          onPress={onObskuraColorModeToggle}
        >
          <IconSymbol
            size={globalStyles.symbolSize}
            color={colors.human.white}
            name={obskuraColorMode === OBSKURA_COLOR_MODE.DEFAULT ? 'sun.max.fill' : 'moon.fill'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
});
