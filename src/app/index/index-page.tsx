import { ScheduledNotifications } from '@components/scheduled-notfications';
import { Scheduler } from '@components/scheduler';
import { useActions } from '@platform';
import { makeStyles, useTheme } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCurrentlyScheduledNotifications } from '../../lib/notifications/use-currently-scheduled-notifications';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { getCurrentlyScheduledNotifications } =
    useCurrentlyScheduledNotifications();
  const { onSetCurrentlyScheduledNotifications } = useActions();

  const onRefresh = async () => {
    setIsRefreshing(true);
    onSetCurrentlyScheduledNotifications(
      await getCurrentlyScheduledNotifications(),
    );
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.background,
        height: '100%',
        paddingHorizontal: 10,
      }}
    >
      <StatusBar style="inverted" />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        <Scheduler />
        <View
          style={{
            paddingVertical: 10,
          }}
        >
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: theme.colors.white,
            }}
          />
        </View>

        <ScheduledNotifications />
      </ScrollView>
    </SafeAreaView>
  );
};
