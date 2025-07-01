import { ThemedText, ThemedView } from '@components/shared';
import { useAffirmations } from '@platform';
import { globalStyles, spacing } from '@styles';
import { getHumanReadableDate } from '@utils';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

export const ScheduleHistory = () => {
  const {
    notifications: { currentlyScheduledNotifications },
  } = useAffirmations();
  //

  const scheduledNotificationsByDate = useMemo(() => {
    return currentlyScheduledNotifications.slice().sort((a, b) => {
      return a.content.data.triggerDate.time - b.content.data.triggerDate.time;
    });
  }, [currentlyScheduledNotifications]);

  return (
    <ThemedView>
      {scheduledNotificationsByDate.map(notification => {
        const { content, identifier } = notification;
        const { month, day, time } = getHumanReadableDate(new Date(content.data.triggerDate.time));

        return (
          <ThemedView key={identifier} style={styles.row}>
            <ThemedView style={styles.dateColumn}>
              <ThemedText
                type="subtitle"
                style={styles.dateText}
              >{`${month.slice(0, 3).toUpperCase()} ${day}`}</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.timeText}>
                {time}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.contentColumn}>
              <ThemedText type="subtitle" style={styles.titleText}>
                {content.title}
              </ThemedText>
              <ThemedText numberOfLines={1}>{content.body}</ThemedText>
            </ThemedView>
          </ThemedView>
        );
      })}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  row: {
    ...globalStyles.flexRow,
    paddingVertical: spacing.sm,
  },
  dateColumn: {
    width: '30%',
  },
  dateText: {
    fontSize: spacing['2xl'],
    ...globalStyles.textCenter,
  },
  timeText: {
    ...globalStyles.textCenter,
  },
  contentColumn: {
    ...globalStyles.alignCenter,
    ...globalStyles.justifyCenter,
    width: '70%',
  },
  titleText: {
    fontSize: spacing['2xl'],
  },
});
