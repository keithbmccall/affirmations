import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { ThemedText, ThemedView } from '../components/shared';
import { globalStyles, spacing } from '../styles';
import { ScreenContainerProps } from './types';

interface LensProps extends ScreenContainerProps {}
const Lens = ({ statusBarProps }: LensProps) => {
  const device = useCameraDevice('back');
  const { hasPermission } = useCameraPermission();

  return (
    <ThemedView style={styles.container}>
      <StatusBar {...statusBarProps} />
      <ThemedText type="subtitle">Lens</ThemedText>
      {device && hasPermission ? (
        <Camera style={StyleSheet.absoluteFill} device={device} isActive={hasPermission} />
      ) : (
        <ThemedText type="title">No camera</ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flexColumn,
    gap: spacing.gap['2xl'],
    paddingVertical: spacing.screenPadding,
  },
  links: {
    marginVertical: spacing['10xl'],
    ...globalStyles.flexRow,
    ...globalStyles.justifyAround,
  },
});

export default Lens;
