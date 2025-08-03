import { ThemedSafeAreaView } from '@components/shared';
import Home from '@screen-containers/home';
import { globalStyles } from '@styles';
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
    ...globalStyles.flex1,
  },
});
