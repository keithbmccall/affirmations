import { ThemedView } from '@components/shared';
import { Notifications } from '@features/notifications';
import { StatusBar } from 'expo-status-bar';
import { ScreenContainerProps } from './types';

interface AffirmationsProps extends ScreenContainerProps {}

const Affirmations = ({ statusBarProps }: AffirmationsProps) => {
  // TODO: wrap with affirmations provider
  return (
    <ThemedView>
      <StatusBar {...statusBarProps} />
      <Notifications />
    </ThemedView>
  );
};

export default Affirmations;
