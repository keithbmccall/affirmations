import { ThemedButton } from '@components/shared/ThemedButton';
import { ThemedText } from '@components/shared/ThemedText';
import { ThemedView } from '@components/shared/ThemedView';
import {
  SCHEDULE_HISTORY_PAGES,
  type HistoryNotification,
  type NotificationIdentifier,
  type NotificationWithData,
  type ScheduleHistoryPages,
} from '@features/Affirmations/Notifications/types';
import { useNotificationsScheduler } from '@features/Affirmations/Notifications/useNotificationsScheduler';
import { useAffirmations } from '@platform';
import { Routes } from '@routes/routes';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { NotificationRow } from './NotificationRow';

const NOTIFICATION_ROW_ESTIMATED_HEIGHT = spacing.sm * 2 + spacing['2xl'] * 2 + spacing.lg;

export const ScheduleHistory = memo(function ScheduleHistory() {
  const [page, setPage] = useState<ScheduleHistoryPages>(SCHEDULE_HISTORY_PAGES.PENDING);

  const bottomTabHeight = useBottomTabBarHeight();
  const {
    notifications: { pendingNotifications, historyNotifications },
  } = useAffirmations();

  const { cancelPushNotification } = useNotificationsScheduler();

  const isPendingPage = page === SCHEDULE_HISTORY_PAGES.PENDING;
  const isHistoryPage = page === SCHEDULE_HISTORY_PAGES.HISTORY;

  const notificationsByDate = useMemo(() => {
    const notifications = isPendingPage ? pendingNotifications : historyNotifications;
    return notifications.slice().sort((a, b) => {
      return a.content.data.triggerDate.time - b.content.data.triggerDate.time;
    });
  }, [pendingNotifications, historyNotifications, page]);

  const handleNotificationPress = useCallback(
    (identifier: NotificationIdentifier) => {
      // console.log('identifier', identifier);
      router.push({
        pathname: Routes.modals.notificationDetails.routePathname,
        params: { notificationId: identifier, page },
      });
    },
    [page]
  );

  const handleNotificationDelete = useCallback(
    async (identifier: NotificationIdentifier) => {
      // console.log('Deleting notification:', identifier);

      try {
        await cancelPushNotification(identifier);
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    },
    [cancelPushNotification, isPendingPage]
  );

  const handlePendingPagePress = useCallback(() => {
    setPage(SCHEDULE_HISTORY_PAGES.PENDING);
  }, []);

  const handleHistoryPagePress = useCallback(() => {
    setPage(SCHEDULE_HISTORY_PAGES.HISTORY);
  }, []);

  const pendingPillStyle = useMemo(
    () => [styles.pill, isPendingPage && styles.activePill],
    [isPendingPage]
  );
  const historyPillStyle = useMemo(
    () => [styles.pill, isHistoryPage && styles.activePill],
    [isHistoryPage]
  );
  const contentContainerStyle = useMemo(
    () => ({ paddingBottom: bottomTabHeight * 2 }),
    [bottomTabHeight]
  );
  const renderItem = useCallback(
    ({ item }: { item: NotificationWithData | HistoryNotification }) => (
      <NotificationRow
        notification={item}
        onPress={handleNotificationPress}
        onDelete={handleNotificationDelete}
      />
    ),
    [handleNotificationDelete, handleNotificationPress]
  );
  const keyExtractor = useCallback(
    (item: NotificationWithData | HistoryNotification) => item.identifier,
    []
  );

  // console.log({ historyNotifications, pendingNotifications });

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.pillContainer}>
        <ThemedButton
          onPress={handlePendingPagePress}
          style={pendingPillStyle}
        >
          <ThemedText type="defaultSemiBold">Pending</ThemedText>
        </ThemedButton>
        <ThemedButton
          onPress={handleHistoryPagePress}
          style={historyPillStyle}
        >
          <ThemedText type="defaultSemiBold">History</ThemedText>
        </ThemedButton>
      </ThemedView>

      <FlashList
        data={notificationsByDate}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={NOTIFICATION_ROW_ESTIMATED_HEIGHT}
        contentContainerStyle={contentContainerStyle}
        style={globalStyles.flex1}
      />
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
  },
  pillContainer: {
    ...globalStyles.flexRow,
    ...globalStyles.justifyAround,
    paddingVertical: spacing.xl,
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.primary[500],
    borderRadius: spacing.borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['4xl'],
    ...globalStyles.alignCenter,
  },
  activePill: {
    backgroundColor: colors.primary[500],
  },
});
