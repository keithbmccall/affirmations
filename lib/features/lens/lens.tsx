import { ThemedView } from '@components/shared/themed-view';
import { Camera } from '@features/lens/camera/components/camera';
import { useInitLensPalettes } from '@features/lens/lens-palette/use-init-lens-palettes';
import { globalStyles } from '@styles/global-styles';
import type { ScreenContainerProps } from '@shared-types/screen-container';
import { StatusBar } from 'expo-status-bar';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

interface LensProps extends ScreenContainerProps {}
const Lens = ({ statusBarProps }: LensProps) => {
  useInitLensPalettes();

  // TODO: wrap with lens provider
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
