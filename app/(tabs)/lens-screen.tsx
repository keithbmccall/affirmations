import { ThemedSafeAreaView } from '@components';
import Lens from '@screen-containers/lens';
import { globalStyles } from '@styles';
import { StyleSheet } from 'react-native';

export default function LensScreen() {
  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      <Lens />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    ...globalStyles.flex1,
  },
});
