import { ScheduleHistory, Scheduler } from '@components/notifications';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet } from 'react-native';
import { ThemedView } from '../components/shared';
import { colors, globalStyles, spacing } from '../styles';
import { ScreenContainerProps } from './types';

interface AffirmationsProps extends ScreenContainerProps {}

const Affirmations = ({ statusBarProps }: AffirmationsProps) => {
  return (
    <ThemedView style={styles.container}>
      <StatusBar {...statusBarProps} />
      <ThemedView style={styles.scheduler}>
        <Scheduler />
      </ThemedView>
      <ScheduleHistory />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flexColumn,
    ...globalStyles.flex1,
    gap: spacing.gap['2xl'],
    padding: spacing.screenPadding,
  },
  scheduler: {
    height: Dimensions.get('window').height * 0.55,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
});

export default Affirmations;
