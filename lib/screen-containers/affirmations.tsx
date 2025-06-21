import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { Scheduler } from '../components/scheduler';
import { ThemedText, ThemedView } from '../components/shared';
import { colors, common, spacing } from '../styles';
import { ScreenContainerProps } from './types';

interface AffirmationsProps extends ScreenContainerProps {}

const Affirmations = ({ statusBarProps }: AffirmationsProps) => {
  return (
    <ThemedView style={styles.container}>
      <StatusBar {...statusBarProps} />
      <ThemedText type="subtitle" style={styles.subtitle}>
        Schedule affirmations
      </ThemedText>
      <Scheduler />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...common.flexColumn,
    ...common.flex1,
    gap: spacing.gap['2xl'],
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.screenPadding,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.gap.md,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.gap.xl,
    color: colors.text.secondary,
  },
});

export default Affirmations;
