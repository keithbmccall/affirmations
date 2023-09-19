import { useNotifications } from '@notifications';
import { Button, Text, View } from 'react-native';

export const PushNotifications = () => {
  const { sendPushNotification, notification, notificationToken } =
    useNotifications();

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}
    >
      {notificationToken && (
        <Text>Your expo push token: {notificationToken.data}</Text>
      )}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text>
          Title: {notification && notification.request.content.title}{' '}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
        <Text>
          Data:{' '}
          {notification && JSON.stringify(notification.request.content.data)}
        </Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={async () => {
          if (notificationToken)
            await sendPushNotification({
              title: 'Noty Title',
              body: '!!!Noty Message!!!',
            });
        }}
      />
    </View>
  );
};
