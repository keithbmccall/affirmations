import { Camera } from '@components/lens';
import { useInitLensPalettes } from '@features/lens/color-lens-palette';
import { globalStyles } from '@styles';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../components/shared';
import { ScreenContainerProps } from './types';

interface LensProps extends ScreenContainerProps {}
const Lens = ({ statusBarProps }: LensProps) => {
  useInitLensPalettes();

  return (
    <ThemedView style={styles.container}>
      <StatusBar {...statusBarProps} />
      <Camera />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
  },
});

export default Lens;
