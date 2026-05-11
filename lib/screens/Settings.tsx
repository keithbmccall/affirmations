import { ThemedInput } from '@components/shared/ThemedInput';
import { ThemedText } from '@components/shared/ThemedText';
import { ThemedView } from '@components/shared/ThemedView';
import { useSettings } from '@platform';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import type { ScreenContainerProps } from '@shared-types/ScreenContainerProps';
import { StatusBar } from 'expo-status-bar';
import { memo } from 'react';
import { NativeSyntheticEvent, StyleSheet, TextInputFocusEventData } from 'react-native';

type SettingsProps = ScreenContainerProps;
const Settings = ({ statusBarProps }: SettingsProps) => {
  const { user, onSetName } = useSettings();

  const updateName = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    onSetName(event.nativeEvent.text);
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar {...statusBarProps} />
      <ThemedText type="subtitle">Settings</ThemedText>

      <ThemedInput
        value={user.name}
        onBlur={updateName}
        placeholder="What's ya name"
        submitBehavior="blurAndSubmit"
        autoCorrect={false}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flexColumn,
    gap: spacing.gap['2xl'],
    paddingVertical: spacing.screenPadding,
  },
});

export default memo(Settings);
