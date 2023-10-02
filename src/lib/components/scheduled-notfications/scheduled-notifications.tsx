import { NotificationCard } from '@components/scheduled-notfications/notification-card';
import { scheduledNotificationsData } from '@data';
import { useNotifications } from '@notifications';
import { View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export const ScheduledNotifications = () => {
  const { currentlyScheduledNotifications } = useNotifications();

  return (
    <View>
      {scheduledNotificationsData?.map(
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
            <TouchableOpacity key={identifier} style={{ paddingVertical: 10 }}>
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
  );
};
