import { Modal } from '@components/Modal';
import { ThemedText } from '@components/shared/ThemedText';
import { ThemedView } from '@components/shared/ThemedView';
import { Scheduler } from '@features/Affirmations/Notifications/Scheduler';
import {
  SCHEDULE_HISTORY_PAGES,
  type HistoryNotification,
  type NotificationIdentifier,
  type NotificationWithData,
} from '@features/Affirmations/Notifications/types';
import { useNotificationsScheduler } from '@features/Affirmations/Notifications/useNotificationsScheduler';
import { useAffirmations } from '@platform';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import type { ScreenContainerProps } from '@shared-types/ScreenContainerProps';
import { getHumanReadableDate } from '@utils/time';
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';

interface NotificationDetailsDisplayProps {
  body: string;
  date: Date;
}

export const NotificationDetailsDisplay = memo(function NotificationDetailsDisplay({
  body,
  date,
}: NotificationDetailsDisplayProps) {
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
});

interface NotificationDetailsProps extends ScreenContainerProps {
  notificationId: NotificationIdentifier;
  page: 'PENDING' | 'HISTORY';
}

// TODO: Delete + Edit logic
export const NotificationDetails = memo(function NotificationDetails({
  notificationId,
  page,
}: NotificationDetailsProps) {
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
  }, [notificationId, isFromHistoryPage, historyNotifications, pendingNotifications]);

  const {
    content: { title, body, data },
  } = notification;
  const identifier = notificationId;
  const initialDate = new Date(data.triggerDate.time);
  const initialTitle = title ?? '';
  const initialBody = body ?? '';

  const handleSubmit = useCallback(
    (values: { title: string; body: string; date: Date }) => {
      editPushNotification({
        identifier,
        ...values,
      });
    },
    [editPushNotification, identifier]
  );
  const submitProps = useMemo(
    () => ({ submitText: 'Edit Message', onSubmit: handleSubmit }),
    [handleSubmit]
  );

  return (
    <Modal title={initialTitle} testID="notification-details-title">
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
          submitProps={submitProps}
        />
      )}
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
  },
  titleContainer: {
    ...globalStyles.flexCenter,
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
