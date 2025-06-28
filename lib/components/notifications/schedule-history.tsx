import { ThemedText, ThemedView } from '@components/shared';
import { useAffirmations } from '@platform';

export const ScheduleHistory = () => {
  const {
    notifications: { currentlyScheduledNotifications },
  } = useAffirmations();
  //
  return (
    <ThemedView>
      {currentlyScheduledNotifications.map(notification => {
        const { content, identifier } = notification;
        return (
          <ThemedView key={identifier}>
            <ThemedText>{content.title}</ThemedText>
          </ThemedView>
        );
      })}
    </ThemedView>
  );
};
