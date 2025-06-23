import { ThemedSafeAreaView } from '@/lib/components/shared';
import Affirmations from '@/lib/screen-containers/affirmations';
import { globalStyles } from '@/lib/styles';
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
