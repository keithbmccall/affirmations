import { Scheduler, ThemedText, ThemedView } from '@components';
import {
  HistoryNotification,
  NotificationIdentifier,
  NotificationWithData,
  SCHEDULE_HISTORY_PAGES,
  useNotificationsScheduler,
} from '@features/notifications';
import { useAffirmations } from '@platform';
import { colors, globalStyles, spacing } from '@styles';
import { getHumanReadableDate } from '@utils';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ScreenContainerProps } from './types';

interface NotificationDetailsDisplayProps {
  body: string;
  date: Date;
}

export const NotificationDetailsDisplay = ({ body, date }: NotificationDetailsDisplayProps) => {
  const { month, day, time } = getHumanReadableDate(date);

  return (
    <ThemedView style={styles.detailsContainer}>
      <ThemedView style={styles.fieldContainer}>
        <ThemedText type="subtitle" style={styles.label}>
          Message
        </ThemedText>
        <ThemedView style={styles.messageContainer}>
          <ThemedText style={styles.messageText}>{body}</ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.fieldContainer}>
        <ThemedText type="subtitle" style={styles.label}>
          Scheduled Date & Time
        </ThemedText>
        <ThemedView style={styles.dateContainer}>
          <ThemedText style={styles.dateText}>{`${month} ${day}, ${time}`}</ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.statusContainer}>
        <ThemedText type="defaultSemiBold" style={styles.statusText}>
          ✓ Notification Delivered
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

interface NotificationDetailsProps extends ScreenContainerProps {
  notificationId: NotificationIdentifier;
  page: 'PENDING' | 'HISTORY';
}

// TODO: Delete + Edit logic
export const NotificationDetails = ({ notificationId, page }: NotificationDetailsProps) => {
  const {
    notifications: { pendingNotifications, historyNotifications },
  } = useAffirmations();
  const { editPushNotification } = useNotificationsScheduler();

  const isFromHistoryPage = page === SCHEDULE_HISTORY_PAGES.HISTORY;
  const notification = useMemo(() => {
    const notifications = isFromHistoryPage ? historyNotifications : pendingNotifications;
    return notifications.find(notification => notification.identifier === notificationId) as
      | NotificationWithData
      | HistoryNotification;
  }, [notificationId, page]);

  const {
    content: { title, body },
  } = notification;
  const identifier = notificationId;
  const initialDate = new Date(notification.content.data.triggerDate.time);
  const initialTitle = title ?? '';
  const initialBody = body ?? '';

  const handleSubmit = (values: { title: string; body: string; date: Date }) => {
    editPushNotification({
      identifier,
      ...values,
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText accessibilityRole="header" testID="notification-details-title" type="subtitle">
          {initialTitle}
        </ThemedText>
      </ThemedView>
      {isFromHistoryPage ? (
        <NotificationDetailsDisplay body={initialBody} date={initialDate} />
      ) : (
        <Scheduler
          bodyLines={6}
          enableRefreshControl={false}
          initialBody={initialBody}
          initialDate={initialDate}
          initialTitle={initialTitle}
          notificationId={notificationId}
          submitProps={{ submitText: 'Edit Message', onSubmit: handleSubmit }}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
  },
  titleContainer: {
    ...globalStyles.center,
    paddingVertical: spacing['2xl'],
  },
  detailsContainer: {
    padding: spacing.screenPadding,
  },
  fieldContainer: {
    marginBottom: spacing['3xl'],
  },
  label: {
    marginBottom: spacing.sm,
    color: colors.text.secondary,
  },
  messageContainer: {
    borderRadius: spacing.borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.ui.border,
  },
  messageText: {
    fontSize: spacing.lg,
    lineHeight: spacing['2xl'],
  },
  dateContainer: {
    borderRadius: spacing.borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.ui.border,
    ...globalStyles.alignCenter,
  },
  dateText: {
    fontSize: spacing.lg,
    fontWeight: '600',
  },
  statusContainer: {
    backgroundColor: colors.accent.green,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.lg,
    ...globalStyles.alignCenter,
    marginTop: spacing.xl,
  },
  statusText: {
    color: colors.human.white,
    fontSize: spacing.lg,
  },
});
