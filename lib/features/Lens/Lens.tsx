import { ThemedView } from '@components/shared/ThemedView';
import { Camera } from '@features/Lens/Camera/Camera';
import { useCameraRollPrefetch } from '@features/Lens/Camera/hooks/useCameraRollPrefetch';
import { useInitLensPalettes } from '@features/Lens/ColorPalette/useInitLensPalettes';
import { globalStyles } from '@styles/globalStyles';
import type { ScreenContainerProps } from '@shared-types/ScreenContainerProps';
import { StatusBar } from 'expo-status-bar';
import { memo } from 'react';
import { StyleSheet } from 'react-native';

type LensProps = ScreenContainerProps;

export const Lens = memo(function Lens({ statusBarProps }: LensProps) {
  useInitLensPalettes();
  useCameraRollPrefetch();

  // TODO: wrap with lens provider
  return (
    <ThemedView style={styles.container}>
      <StatusBar {...statusBarProps} />
      <Camera />
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
  },
});
