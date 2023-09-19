import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { StateContextProvider } from './lib/platform/state';
import { PushNotifications } from './notifications-form';

export const Root = () => {
  return (
    <StateContextProvider>
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your affirmationz!!</Text>
        <PushNotifications />

        <StatusBar style="auto" />
      </View>
    </StateContextProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
