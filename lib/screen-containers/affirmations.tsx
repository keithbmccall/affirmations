import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { Scheduler } from '../components/scheduler';
import { ThemedText, ThemedView } from '../components/shared';
import { colors, globalStyles, spacing } from '../styles';
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
    ...globalStyles.flexColumn,
    ...globalStyles.flex1,
    gap: spacing.gap['2xl'],
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.screenPadding,
  },
  subtitle: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
});

export default Affirmations;
