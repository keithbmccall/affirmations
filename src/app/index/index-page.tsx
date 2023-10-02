import { ScheduledNotifications } from '@components/scheduled-notfications';
import { Scheduler } from '@components/scheduler';
import { makeStyles, Text, useTheme } from '@rneui/themed';
import { Link } from 'expo-router';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const useStyles = makeStyles((theme, props: any) => ({
  container: {
    background: theme.colors.white,
    width: '100%',
  },
  text: {
    color: theme.colors.primary,
  },
}));

export const IndexPage = (props: any) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.background,
        height: '100%',
        paddingHorizontal: 10,
      }}
    >
      <ScrollView>
        <Text>Index page</Text>
        <Link href="/history"> go to history</Link>
        <Scheduler />
        <ScheduledNotifications />
      </ScrollView>
    </SafeAreaView>
  );
};
