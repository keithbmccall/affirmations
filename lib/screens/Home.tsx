import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconSymbol } from '@components/shared/icon-symbol/IconSymbol';
import { ThemedText } from '@components/shared/ThemedText';
import { ThemedView } from '@components/shared/ThemedView';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import type { ScreenContainerProps } from '@shared-types/ScreenContainerProps';
import Settings from './Settings';

type HomeProps = ScreenContainerProps;
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
