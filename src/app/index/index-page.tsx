import { ScheduledNotifications } from '@components/scheduled-notfications';
import { Scheduler } from '@components/scheduler';
import { Divider } from '@components/shared';
import { useDimensions } from '@platform';
import { useTheme } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const IndexPage = () => {
  const { theme } = useTheme();
  const { remainingHeight: scheduledNotificationsHeight, setRemainingHeight } =
    useDimensions();

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.background,
        height: '100%',
        paddingHorizontal: 10,
      }}
    >
      <StatusBar style="inverted" />
      <View
        onLayout={event => {
          setRemainingHeight(event.nativeEvent.layout.height);
        }}
      >
        <Scheduler
          containerStyle={{
            height: 'auto',
          }}
        />
        <Divider />
      </View>

      <ScheduledNotifications
        containerStyle={{
          height: scheduledNotificationsHeight,
        }}
      />
    </SafeAreaView>
  );
};
