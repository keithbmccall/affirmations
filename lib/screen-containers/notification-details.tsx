import { ThemedText, ThemedView } from '@components';
import { NotificationIdentifier } from '@features/notifications';
import { useAffirmations } from '@platform';
import { colors, globalStyles, spacing } from '@styles';
import { getHumanReadableDate } from '@utils';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainerProps } from './types';

interface NotificationDetailsProps extends ScreenContainerProps {
  notificationId: NotificationIdentifier;
  page: 'PENDING' | 'HISTORY';
}
// TODO: Delete + Edit logic
export const NotificationDetails = ({ notificationId, page }: NotificationDetailsProps) => {
  const { top } = useSafeAreaInsets();
  const {
    notifications: { pendingNotifications, historyNotifications },
  } = useAffirmations();

  const notification = useMemo(() => {
    const notifications = page === 'PENDING' ? pendingNotifications : historyNotifications;
    return notifications.find(notification => notification.identifier === notificationId);
  }, [notificationId, page]);

  if (notification) {
    const { content, identifier } = notification;
    const { month, day, time } = getHumanReadableDate(
      new Date(notification.content.data.triggerDate.time)
    );
    const scheduledDate = getHumanReadableDate(
      new Date(notification.content.data.scheduledDate.time)
    );

    const handleClose = () => {
      router.back();
    };

    return (
      <ThemedView style={[styles.container, { paddingTop: top }]}>
        {/* Header with close button */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.headerTitle}>Notification Details</ThemedText>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Message</ThemedText>
            <ThemedView style={styles.messageContainer}>
              <ThemedText style={styles.messageTitle}>{content.title}</ThemedText>
              <ThemedText style={styles.messageBody}>{content.body}</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Schedule Information</ThemedText>
            <ThemedView style={styles.infoContainer}>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Type:</ThemedText>
                <ThemedText style={styles.infoValue}>{page}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Trigger Date:</ThemedText>
                <ThemedText style={styles.infoValue}>{`${month} ${day}, ${time}`}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Created:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {`${scheduledDate.month} ${scheduledDate.day}, ${scheduledDate.time}`}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Identifier:</ThemedText>
                <ThemedText style={styles.infoValue} numberOfLines={1}>
                  {identifier}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ScrollView>

        {/* Action Buttons */}
        <ThemedView style={styles.footer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleClose}>
            <ThemedText style={styles.actionButtonText}>Close</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  //   Error state
  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Error</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <ThemedText style={styles.closeButtonText}>✕</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ThemedView style={styles.content}>
        <ThemedText style={styles.errorText}>Missing notification data</ThemedText>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.back()}>
          <ThemedText style={styles.actionButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  header: {
    ...globalStyles.rowBetween,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.ui.background,
    borderTopLeftRadius: spacing.borderRadius.lg,
    borderTopRightRadius: spacing.borderRadius.lg,
    marginTop: spacing['8xl'],
    marginHorizontal: spacing.lg,
  },
  headerTitle: {
    ...globalStyles.flex1,
    fontSize: spacing.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    width: spacing['3xl'],
    height: spacing['3xl'],
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.gray[200],
    ...globalStyles.center,
  },
  closeButtonText: {
    fontSize: spacing.lg,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  content: {
    ...globalStyles.flex1,
    backgroundColor: colors.ui.background,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontSize: spacing.lg,
    fontWeight: '600',
    color: colors.primary[500],
  },
  messageContainer: {
    padding: spacing.lg,
    backgroundColor: colors.ui.surface,
    borderRadius: spacing.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  messageTitle: {
    fontSize: spacing.xl,
    fontWeight: '600',
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  messageBody: {
    fontSize: spacing.lg,
    lineHeight: spacing['2xl'],
    color: colors.text.secondary,
  },
  infoContainer: {
    gap: spacing.md,
  },
  infoRow: {
    ...globalStyles.rowBetween,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.ui.surface,
    borderRadius: spacing.borderRadius.sm,
  },
  infoLabel: {
    fontWeight: '600',
    color: colors.text.secondary,
    ...globalStyles.flex1,
  },
  infoValue: {
    flex: 2,
    ...globalStyles.textRight,
    color: colors.text.primary,
  },
  footer: {
    backgroundColor: colors.ui.background,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.lg,
    borderBottomLeftRadius: spacing.borderRadius.lg,
    borderBottomRightRadius: spacing.borderRadius.lg,
  },
  actionButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.md,
    ...globalStyles.center,
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontWeight: '600',
    fontSize: spacing.lg,
  },
  errorText: {
    color: colors.text.secondary,
    fontSize: spacing.lg,
    marginBottom: spacing.xl,
  },
});
