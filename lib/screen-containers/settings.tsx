import { StatusBar } from 'expo-status-bar';
import { NativeSyntheticEvent, StyleSheet, TextInputFocusEventData } from 'react-native';
import { ThemedInput, ThemedText, ThemedView } from '../components/shared';
import { useSettings } from '../platform/hooks';
import { globalStyles, spacing } from '../styles';
import { ScreenContainerProps } from './types';

interface SettingsProps extends ScreenContainerProps {}
const Settings = ({ statusBarProps }: SettingsProps) => {
  const { settings, onSetName } = useSettings();

  const updateName = (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
    onSetName(event.nativeEvent.text);
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar {...statusBarProps} />
      <ThemedText type="subtitle">Settings</ThemedText>

      <ThemedInput
        value={settings.user.name}
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
  links: {
    marginVertical: spacing['10xl'],
    ...globalStyles.flexRow,
    ...globalStyles.justifyAround,
  },
});

export default Settings;
