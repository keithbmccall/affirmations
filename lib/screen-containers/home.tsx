import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { IconSymbol, ThemedText, ThemedView } from '../components/shared';
import { colors, common, spacing } from '../styles';
import Settings from './settings';
import { ScreenContainerProps } from './types';

interface HomeProps extends ScreenContainerProps {}

const Home = ({ statusBarProps }: HomeProps) => {
  return (
    <ThemedView style={styles.container}>
      <StatusBar {...statusBarProps} />
      <Settings />
      <ThemedText type="subtitle">Table of Contents</ThemedText>
      <View style={styles.linksContainer}>
        <Link href={{ pathname: '/(tabs)/lens-screen' }}>
          <IconSymbol size={50} color={colors.secondary['900']} name="camera.fill" />
        </Link>
        <Link href={{ pathname: '/(tabs)/affirmations-screen' }}>
          <IconSymbol size={50} color={colors.secondary['900']} name="note.text" />
        </Link>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...common.flexColumn,
    ...common.flex1,
    gap: spacing.gap['3xl'],
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.screenPadding,
  },
  linksContainer: {
    marginVertical: spacing['10xl'],
    ...common.flexRow,
    ...common.justifyAround,
  },
});

export default Home;
