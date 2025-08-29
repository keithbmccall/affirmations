import { ThemedSafeAreaView } from '@components/shared';
import { Affirmations } from '@features/affirmations';
import { globalStyles } from '@styles';
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
