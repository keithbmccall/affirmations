
import { globalStyles } from '@styles';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@components/shared';
import { ScreenContainerProps } from './types';
import { useInitLensPalettes } from '@features/lens/lens-palette';
import { Camera } from '@features/lens/camera';


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
