import { StatusBar } from 'expo-status-bar';
import { NativeSyntheticEvent, StyleSheet, TextInputFocusEventData } from 'react-native';
import { ThemedInput, ThemedText, ThemedView } from '../components/shared';
import { useSettings } from '../platform/hooks';
import { common, spacing } from '../styles';
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
    gap: spacing.gap['2xl'],
  },
  links: {
    marginVertical: spacing['10xl'],
    ...common.flexRow,
    ...common.justifyAround,
  },
});

export default Settings;
