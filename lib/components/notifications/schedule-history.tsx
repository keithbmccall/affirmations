import { ThemedText, ThemedView } from '@components/shared';
import { useAffirmations } from '@platform';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { colors, globalStyles, spacing } from '@styles';
import { getHumanReadableDate } from '@utils';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const PAGE = {
  CURRENTLY_SCHEDULED: 'CURRENTLY_SCHEDULED',
  HISTORY: 'HISTORY',
} as const;
type PageType = (typeof PAGE)[keyof typeof PAGE];

export const ScheduleHistory = () => {
  const [page, setPage] = useState<PageType>(PAGE.CURRENTLY_SCHEDULED);

  const bottomTabHeight = useBottomTabBarHeight();
  const {
    notifications: { currentlyScheduledNotifications, historyNotifications },
  } = useAffirmations();

  const isCurrentlyScheduledPage = page === PAGE.CURRENTLY_SCHEDULED;
  const isHistoryPage = page === PAGE.HISTORY;

  const notificationsByDate = useMemo(() => {
    const notifications = isCurrentlyScheduledPage
      ? currentlyScheduledNotifications
      : historyNotifications;
    return notifications.slice().sort((a, b) => {
      return a.content.data.triggerDate.time - b.content.data.triggerDate.time;
    });
  }, [currentlyScheduledNotifications, historyNotifications, page]);

  return (
    <ThemedView>
      <ThemedView
        style={{
          ...globalStyles.flexRow,
          ...globalStyles.justifyAround,
          paddingVertical: spacing.xl,
        }}
      >
        <TouchableOpacity
          onPress={() => setPage(PAGE.CURRENTLY_SCHEDULED)}
          style={[
            styles.pill,
            isCurrentlyScheduledPage && { backgroundColor: colors.primary[500] },
          ]}
        >
          <ThemedText type="defaultSemiBold">Pending</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setPage(PAGE.HISTORY)}
          style={[styles.pill, isHistoryPage && { backgroundColor: colors.primary[500] }]}
        >
          <ThemedText type="defaultSemiBold">History</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView contentContainerStyle={{ paddingBottom: bottomTabHeight * 2 }}>
        {notificationsByDate.map(notification => {
          const { content, identifier } = notification;
          const { month, day, time } = getHumanReadableDate(
            new Date(content.data.triggerDate.time)
          );

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
      </ScrollView>
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
  pill: {
    borderWidth: 1,
    borderColor: colors.primary[500],
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['4xl'],
    ...globalStyles.alignCenter,
  },
});
