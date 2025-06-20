import { ThemedSafeAreaView } from '@/lib/components/shared';
import Home from '@/lib/screen-containers/home';
import { common } from '@/lib/styles';
import { StyleSheet } from 'react-native';

// will serve as settings page as well for the time being
export default function HomeScreen() {
  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      <Home />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    ...common.flex1,
  },
});
