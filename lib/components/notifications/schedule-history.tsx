import { ThemedButton, ThemedText, ThemedView } from '@components/shared';
import {
  HistoryNotification,
  NotificationWithData,
  SCHEDULE_HISTORY_PAGES,
  ScheduleHistoryPages,
} from '@features/notifications';
import { useAffirmations } from '@platform';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { colors, globalStyles, spacing } from '@styles';
import { getHumanReadableDate } from '@utils';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

// TODO: swipe to delete logic
export const ScheduleHistory = () => {
  const [page, setPage] = useState<ScheduleHistoryPages>(SCHEDULE_HISTORY_PAGES.PENDING);

  const bottomTabHeight = useBottomTabBarHeight();
  const {
    notifications: { pendingNotifications, historyNotifications },
  } = useAffirmations();

  const isPendingPage = page === SCHEDULE_HISTORY_PAGES.PENDING;
  const isHistoryPage = page === SCHEDULE_HISTORY_PAGES.HISTORY;

  const notificationsByDate = useMemo(() => {
    const notifications = isPendingPage ? pendingNotifications : historyNotifications;
    return notifications.slice().sort((a, b) => {
      return a.content.data.triggerDate.time - b.content.data.triggerDate.time;
    });
  }, [pendingNotifications, historyNotifications, page]);

  const handleNotificationPress = (notification: NotificationWithData | HistoryNotification) => {
    // Navigate to the modal with just the notification identifier
    router.push({
      pathname: '/(modals)/notification-details-modal',
      params: {
        notificationId: notification.identifier,
        page,
      },
    });
  };

  return (
    <ThemedView>
      <ThemedView style={styles.pillContainer}>
        <ThemedButton
          onPress={() => setPage(SCHEDULE_HISTORY_PAGES.PENDING)}
          style={[styles.pill, isPendingPage && { backgroundColor: colors.primary[500] }]}
        >
          <ThemedText type="defaultSemiBold">Pending</ThemedText>
        </ThemedButton>
        <ThemedButton
          onPress={() => setPage(SCHEDULE_HISTORY_PAGES.HISTORY)}
          style={[styles.pill, isHistoryPage && { backgroundColor: colors.primary[500] }]}
        >
          <ThemedText type="defaultSemiBold">History</ThemedText>
        </ThemedButton>
      </ThemedView>

      <ScrollView contentContainerStyle={{ paddingBottom: bottomTabHeight * 2 }}>
        {notificationsByDate.map(notification => {
          const { content, identifier } = notification;
          const { month, day, time } = getHumanReadableDate(
            new Date(content.data.triggerDate.time)
          );

          return (
            <ThemedButton key={identifier} onPress={() => handleNotificationPress(notification)}>
              <ThemedView style={styles.row}>
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
            </ThemedButton>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    ...globalStyles.flexRow,
    ...globalStyles.justifyAround,
    paddingVertical: spacing.xl,
  },
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
