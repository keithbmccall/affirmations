import { useDimensions } from '@platform';
import { Button, useTheme } from '@rneui/themed';
import { ScheduledNotifications } from '@scheduled-notifications';
import { Scheduler } from '@scheduler';
import { Divider } from '@shared-components';
import { globalStyles, spacingValues } from '@theme';
import { Link, router } from 'expo-router';
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
      <Button
        title="Events testing"
        onPress={() => {
          router.push('/history');
        }}
        buttonStyle={{
          backgroundColor: theme.colors.grey5,
        }}
        containerStyle={{
          width: '100%',
          ...globalStyles.borderRadius10,
          marginTop: spacingValues.standard,
        }}
      />
      <Link href="/history">events testing</Link>
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
