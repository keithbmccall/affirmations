import { Camera } from '@components/lens';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '../components/shared';
import { ScreenContainerProps } from './types';

interface LensProps extends ScreenContainerProps {}

const Lens = ({ statusBarProps }: LensProps) => {
  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar {...statusBarProps} />
      <Camera statusBarProps={statusBarProps} />
    </ThemedView>
  );
};

export default Lens;
