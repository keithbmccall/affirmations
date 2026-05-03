import { ThemedView } from '@components/shared/themed-view';
import { Notifications } from '@features/affirmations/notifications/components/notifications';
import type { ScreenContainerProps } from '@shared-types/screen-container';
import { StatusBar } from 'expo-status-bar';
import { memo } from 'react';

interface AffirmationsProps extends ScreenContainerProps {}

export const Affirmations = memo(({ statusBarProps }: AffirmationsProps) => {
  // TODO: wrap with affirmations provider
  return (
    <ThemedView>
      <StatusBar {...statusBarProps} />
      <Notifications />
    </ThemedView>
  );
});
