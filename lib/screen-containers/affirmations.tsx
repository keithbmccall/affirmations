import { StatusBar } from 'expo-status-bar';
import { Notifications } from '@features/notifications';
import { ThemedView } from '@components/shared';
import { ScreenContainerProps } from './types';

interface AffirmationsProps extends ScreenContainerProps {}

const Affirmations = ({ statusBarProps }: AffirmationsProps) => {
  return (
    <ThemedView>
      <StatusBar {...statusBarProps} />
      <Notifications />
    </ThemedView>
  );
};

export default Affirmations;
