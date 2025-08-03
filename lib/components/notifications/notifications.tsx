import { ScheduleHistory, Scheduler } from '@components/notifications';
import { Divider, ThemedText, ThemedView } from '@components/shared';
import { useAffirmations } from '@platform';
import { colors, globalStyles, spacing } from '@styles';
import { Dimensions, StyleSheet } from 'react-native';

export const Notifications = () => {
  const {
    notifications: { token },
  } = useAffirmations();

  return token ? (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.scheduler}>
        <Scheduler />
      </ThemedView>
      <Divider color={colors.ui.border} />
      <ThemedView style={styles.scheduleHistory}>
        <ScheduleHistory />
      </ThemedView>
    </ThemedView>
  ) : (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.errorText}>Notifications are not enabled</ThemedText>
    </ThemedView>
  );
};

const heightDimension = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    ...globalStyles.flexColumn,
    ...globalStyles.flex1,
    padding: spacing.screenPadding,
  },
  errorText: {
    ...globalStyles.center,
    color: colors.human.white,
  },
  scheduler: {
    height: heightDimension * 0.53,
  },
  scheduleHistory: {
    height: heightDimension * 0.37,
  },
});
