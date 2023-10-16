import { ScheduledNotifications } from '@components/scheduled-notfications';
import { Scheduler } from '@components/scheduler';
import { makeStyles, Text, useTheme } from '@rneui/themed';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

enum VIEW_MODE {
  SCHEDULED = 'SCHEDULED',
  HISTORY = 'HISTORY',
}

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
  const [viewMode, setViewMode] = useState<VIEW_MODE>(VIEW_MODE.SCHEDULED);

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
        <View>
          <View
            style={{
              flexDirection: 'row',

              borderWidth: 3,
              borderRadius: 10,
              borderColor: theme.colors.grey5,
            }}
          >
            <TouchableOpacity
              style={{
                padding: 10,
              }}
              onPress={() => {
                setViewMode(VIEW_MODE.SCHEDULED);
              }}
              containerStyle={{
                width: '50%',
                justifyContent: 'center',
                alignItems: 'center',
                ...(viewMode === VIEW_MODE.SCHEDULED && {
                  borderStyle: 'solid',
                  borderColor: theme.colors.grey5,
                  backgroundColor: theme.colors.grey5,
                  borderWidth: 1,
                  borderRadius: 10,
                }),
              }}
            >
              <Text>Scheduled</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                padding: 10,
              }}
              onPress={() => {
                setViewMode(VIEW_MODE.HISTORY);
              }}
              containerStyle={{
                width: '50%',
                justifyContent: 'center',
                alignItems: 'center',
                ...(viewMode === VIEW_MODE.HISTORY && {
                  borderStyle: 'solid',
                  borderColor: theme.colors.grey5,
                  backgroundColor: theme.colors.grey5,
                  borderWidth: 1,
                  borderRadius: 10,
                }),
              }}
            >
              <Text>History</Text>
            </TouchableOpacity>
          </View>
          {viewMode === VIEW_MODE.SCHEDULED ? (
            <ScheduledNotifications />
          ) : (
            <View>
              <Text>HISTORY</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
