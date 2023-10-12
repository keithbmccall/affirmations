import { ScheduledNotifications } from '@components/scheduled-notfications';
import { Scheduler } from '@components/scheduler';
import { makeStyles, useTheme } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';
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
      <StatusBar style="inverted" />
      <ScrollView>
        <Scheduler />
        <ScheduledNotifications />
      </ScrollView>
    </SafeAreaView>
  );
};
