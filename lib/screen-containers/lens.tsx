import { ThemedView } from '@components/shared';
import { Camera } from '@features/lens/camera';
import { useInitLensPalettes } from '@features/lens/lens-palette';
import { globalStyles } from '@styles';
import { StatusBar } from 'expo-status-bar';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
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

export default memo(Lens);
