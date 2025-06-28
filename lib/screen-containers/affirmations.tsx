import { ScheduleHistory, Scheduler } from '@components/notifications';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet } from 'react-native';
import { Divider, ThemedView } from '../components/shared';
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
      <Divider color={colors.ui.border} />
      <ThemedView style={styles.scheduleHistory}>
        <ScheduleHistory />
      </ThemedView>
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
  scheduler: {
    height: heightDimension * 0.53,
  },
  scheduleHistory: {
    height: heightDimension * 0.37,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
});

export default Affirmations;
