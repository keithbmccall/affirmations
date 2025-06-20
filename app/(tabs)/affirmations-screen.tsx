import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/lib/components/shared/icon-symbol/icon-symbol';
import { ThemedText } from '@/lib/components/shared/themed-text';
import { StyleSheet } from 'react-native';

export default function AffirmationsScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol size={310} color="#808080" name="note.text" style={styles.headerImage} />
      }
    >
      <ThemedText type="title">Affirmation</ThemedText>
      <ThemedText type="default">Message generator and scheduler</ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});
