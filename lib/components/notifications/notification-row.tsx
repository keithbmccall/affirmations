import { ThemedButton, ThemedText, ThemedView } from '@components/shared';
import {
  HistoryNotification,
  NotificationIdentifier,
  NotificationWithData,
} from '@features/notifications';
import { globalStyles, spacing } from '@styles';
import { getHumanReadableDate } from '@utils';
import { StyleSheet } from 'react-native';

interface NotificationRowContentProps {
  notification: NotificationWithData | HistoryNotification;
}

const NotificationRowContent = ({ notification }: NotificationRowContentProps) => {
  const { content } = notification;
  const { month, day, time } = getHumanReadableDate(new Date(content.data.triggerDate.time));

  return (
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
  );
};

interface NotificationRowProps {
  notification: NotificationWithData | HistoryNotification;
  onPress?: (identifier: NotificationIdentifier) => void;
}

export const NotificationRow = ({ notification, onPress }: NotificationRowProps) => {
  const { identifier } = notification;

  if (onPress) {
    return (
      <ThemedButton onPress={() => onPress(identifier)} testID={`notification-row-${identifier}`}>
        <NotificationRowContent notification={notification} />
      </ThemedButton>
    );
  }

  return (
    <ThemedView testID={`notification-row-${identifier}`}>
      <NotificationRowContent notification={notification} />
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
