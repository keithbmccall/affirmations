import { ThemedSafeAreaView } from '@components/shared/themed-safe-area-view';
import { Affirmations } from '@features/affirmations/affirmations';
import { globalStyles } from '@styles/global-styles';
import { StyleSheet } from 'react-native';

export default function AffirmationsScreen() {
  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      <Affirmations />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    ...globalStyles.flex1,
  },
});
