import { IconSymbol } from '@components/shared/icon-symbol/IconSymbol';
import { cameraTopControlsStyles as styles } from '@features/Lens/Camera/cameraTopControlsStyles';
import { useCameraSurface } from '@features/Lens/Camera/CameraSurfaceContext';
import { cameraDeviceOptions, flashModeOptions, gridModeOptions } from '@features/Lens/Camera/options';
import { OBSKURA_COLOR_MODE, type ObskuraColorMode } from '@features/Lens/Obskura/options';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { memo, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ObskuraCameraTopControlsProps {
  obskuraColorMode: ObskuraColorMode;
  onObskuraColorModeToggle: () => void;
}

export const ObskuraCameraTopControls = memo(function ObskuraCameraTopControls({
  obskuraColorMode,
  onObskuraColorModeToggle,
}: ObskuraCameraTopControlsProps) {
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
          name="camera.fill"
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
    </View>
  );
});
