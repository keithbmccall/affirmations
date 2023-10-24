import { NotificationCard } from '@components/scheduled-notfications/notification-card';
import { useNotifications } from '@notifications';
import { makeStyles, Text, useTheme } from '@rneui/themed';
import { globalStyles } from '@theme';
import { useState } from 'react';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

enum VIEW_MODE {
  SCHEDULED = 'SCHEDULED',
  HISTORY = 'HISTORY',
}
export const ScheduledNotifications = () => {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<VIEW_MODE>(VIEW_MODE.SCHEDULED);
  const styles = useStyles(theme);
  const { currentlyScheduledNotifications, historyNotifications } =
    useNotifications();

  return (
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
          containerStyle={[
            styles.notificationCategoryOption,
            viewMode === VIEW_MODE.SCHEDULED &&
              styles.selectedNotificationCategoryOption,
          ]}
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
          containerStyle={[
            styles.notificationCategoryOption,
            viewMode === VIEW_MODE.HISTORY &&
              styles.selectedNotificationCategoryOption,
          ]}
        >
          <Text>History</Text>
        </TouchableOpacity>
      </View>
      {viewMode === VIEW_MODE.SCHEDULED ? (
        <View>
          {currentlyScheduledNotifications?.map(
            ({
              identifier,
              content: {
                title,
                body,
                data: { date, time, rawDate },
              },
            }) => {
              const dateObject = new Date(time);
              const hours = dateObject.getHours();
              const minutes = dateObject.getMinutes();
              return (
                <TouchableOpacity
                  key={identifier}
                  style={{ paddingVertical: 10 }}
                >
                  <NotificationCard
                    body={body}
                    title={title}
                    time={{ hours, minutes }}
                  />
                </TouchableOpacity>
              );
            },
          )}
        </View>
      ) : (
        <View>
          {historyNotifications?.map(
            ({
              identifier,
              content: {
                title,
                body,
                data: { date, time, rawDate },
              },
            }) => {
              const dateObject = new Date(time);
              const hours = dateObject.getHours();
              const minutes = dateObject.getMinutes();
              return (
                <TouchableOpacity
                  key={`${identifier}_${time}`}
                  style={{ paddingVertical: 10 }}
                >
                  <NotificationCard
                    body={body}
                    title={title}
                    time={{ hours, minutes }}
                  />
                </TouchableOpacity>
              );
            },
          )}
        </View>
      )}
    </View>
  );
};
export const useStyles = makeStyles((theme, props: any) => ({
  notificationCategoryOption: {
    width: '50%',
    ...globalStyles.justifyCenter,
  },
  selectedNotificationCategoryOption: {
    borderStyle: 'solid',
    borderColor: theme.colors.grey5,
    backgroundColor: theme.colors.grey5,
    borderWidth: 1,
    borderRadius: 10,
  },
}));
