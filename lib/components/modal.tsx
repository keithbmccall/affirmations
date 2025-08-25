import { colors, globalStyles, spacing } from '@styles';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from './shared/themed-text';
import { ThemedView } from './shared/themed-view';

interface ModalProps {
  children: ReactNode;
  testID: string;
  title: string;
}

export const Modal = ({ children, title, testID }: ModalProps) => {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.stub} />
        <ThemedText accessibilityRole="header" testID={testID} type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <View style={styles.stub} />
      </ThemedView>
      <ThemedView style={styles.contentContainer}>{children}</ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
  },
  header: {
    ...globalStyles.flexRow,
    justifyContent: 'space-between',
    // alignItems: 'center',
  },
  title: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.screenPadding,
    textAlign: 'center',
  },
  contentContainer: {
    ...globalStyles.flex1,
  },
  stub: {
    height: 1,
    backgroundColor: colors.human.white,
  },
});
