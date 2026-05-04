import { ThemedView } from '@components/shared/ThemedView';
import { Notifications } from '@features/Affirmations/Notifications/Notifications';
import type { ScreenContainerProps } from '@shared-types/ScreenContainerProps';
import { StatusBar } from 'expo-status-bar';
import { memo } from 'react';

type AffirmationsProps = ScreenContainerProps;

export const Affirmations = memo(function Affirmations({ statusBarProps }: AffirmationsProps) {
  // TODO: wrap with affirmations provider
  return (
    <ThemedView>
      <StatusBar {...statusBarProps} />
      <Notifications />
    </ThemedView>
  );
});
