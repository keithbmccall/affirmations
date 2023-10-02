import { Text, useTheme } from '@rneui/themed';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HistoryPage = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.background,
        height: '100%',
        paddingHorizontal: 10,
      }}
    >
      <StatusBar style="inverted" />
      <ScrollView>
        <Text>History page</Text>
        <Link href="/"> go to index</Link>
      </ScrollView>
    </SafeAreaView>
  );
};
