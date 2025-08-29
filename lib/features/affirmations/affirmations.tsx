import { ThemedView } from '@components/shared';
import { Notifications } from '@features/affirmations/notifications';
import { ScreenContainerProps } from '@types';
import { StatusBar } from 'expo-status-bar';

interface AffirmationsProps extends ScreenContainerProps {}

export const Affirmations = ({ statusBarProps }: AffirmationsProps) => {
  // TODO: wrap with affirmations provider
  return (
    <ThemedView>
      <StatusBar {...statusBarProps} />
      <Notifications />
    </ThemedView>
  );
};
