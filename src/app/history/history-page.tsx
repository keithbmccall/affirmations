import { Text } from '@rneui/themed';
import { Link } from 'expo-router';
import { ScrollView } from 'react-native';

export const HistoryPage = () => {
  return (
    <ScrollView>
      <Text>History page</Text>
      <Link href="/"> go to index</Link>
    </ScrollView>
  );
};
