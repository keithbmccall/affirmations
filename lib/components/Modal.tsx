import { ThemedText } from './shared/ThemedText';
import { ThemedView } from './shared/ThemedView';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import { router } from 'expo-router';
import { memo, ReactNode, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface ModalProps {
  children: ReactNode;
  testID: string;
  title: string;
  enableBackButton?: boolean;
}

export const Modal = memo(function Modal({ children, title, testID, enableBackButton }: ModalProps) {
  const handleBackPress = useCallback(() => {
    router.back();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        {enableBackButton ? (
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <ThemedText type="default">Back</ThemedText>
          </Pressable>
        ) : (
          <View style={styles.stub} />
        )}

        <ThemedText accessibilityRole="header" testID={testID} type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        <View style={styles.stub} />
      </ThemedView>
      <ThemedView style={styles.contentContainer}>{children}</ThemedView>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
  },
  header: {
    ...globalStyles.flexRow,
    justifyContent: 'space-around',
    alignItems: 'center',
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
    width: 40,
    backgroundColor: colors.human.white,
  },
  backButton: {
    width: 40,
  },
});
