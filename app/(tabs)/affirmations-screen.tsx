import { ThemedSafeAreaView } from '@components/shared/ThemedSafeAreaView';
import { Affirmations } from '@features/Affirmations/Affirmations';
import { globalStyles } from '@styles/globalStyles';
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
