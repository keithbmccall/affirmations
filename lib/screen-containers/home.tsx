import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconSymbol, ThemedText, ThemedView } from '../components/shared';
import { colors, globalStyles, spacing } from '../styles';
import { ScreenContainerProps } from '../types';
import Settings from './settings';

interface HomeProps extends ScreenContainerProps {}
const lensScreenHref = { pathname: '/(tabs)/lens-screen' } as const;
const affirmationsScreenHref = { pathname: '/(tabs)/affirmations-screen' } as const;

const Home = ({ statusBarProps }: HomeProps) => {
  return (
    <ThemedView style={styles.container}>
      <StatusBar {...statusBarProps} />
      <Settings />
      <ThemedText type="subtitle">Table of Contents</ThemedText>
      <View style={styles.linksContainer}>
        <Link href={lensScreenHref}>
          <IconSymbol size={50} color={colors.primary['500']} name="camera.fill" />
        </Link>
        <Link href={affirmationsScreenHref}>
          <IconSymbol size={50} color={colors.primary['500']} name="note.text" />
        </Link>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flexColumn,
    ...globalStyles.flex1,
    gap: spacing.gap['3xl'],
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.screenPadding,
  },
  linksContainer: {
    marginVertical: spacing['10xl'],
    ...globalStyles.flexRow,
    ...globalStyles.justifyAround,
  },
});

export default memo(Home);
