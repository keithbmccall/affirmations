import { useNotifications } from '@notifications';
import { NotificationRequestWithData } from '@platform';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Input, Text } from '@rneui/themed';
import { useRef, useState } from 'react';
import { View } from 'react-native';

const useInputRef = () => useRef<any>();

export const Scheduler = () => {
  const [previouslyScheduled, setPreviouslyScheduled] = useState<
    NotificationRequestWithData[] | null
  >(null);
  const [time, setTime] = useState<Date>(new Date());
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const titleInput = useInputRef();
  const messageInput = useInputRef();
  const { schedulePushNotification, currentlyScheduledNotifications } =
    useNotifications();

  return (
    <View
      style={{
        alignItems: 'center',
      }}
    >
      <DateTimePicker
        value={time}
        mode="time"
        display="default"
        onChange={(a, b) => {
          if (b) {
            setTime(b);
          }
        }}
      />
      <View
        style={{
          width: '100%',
          borderStyle: 'solid',
          borderColor: 'blue',
          borderWidth: 1,
        }}
      >
        <Input
          ref={titleInput}
          onChangeText={value => {
            setTitle(value);
          }}
          placeholder="Title"
          style={{ width: '100%' }}
        />

        <Input
          ref={messageInput}
          onChangeText={value => {
            setMessage(value);
          }}
          placeholder="Message"
        />
        <Button
          title="commit"
          onPress={async () => {
            console.log(
              `Committed with title of ${title} and message of ${message} and time of ${time}`,
            );
            await schedulePushNotification(time, title, message);
            // const previouslyScheduledNotifications =
            //   await getAllScheduledNotifications();
            // setPreviouslyScheduled(previouslyScheduledNotifications);
          }}
        />
        {currentlyScheduledNotifications?.map(
          ({
            identifier,
            content: {
              title,
              body,
              data: { date, time, rawDate },
            },
          }) => {
            return (
              <View key={identifier}>
                <Text>{`Time: ${rawDate}`}</Text>
                <Text>{`Title: ${title}`}</Text>
                <Text>{`Message: ${body}`}</Text>
              </View>
            );
          },
        )}
      </View>
    </View>
  );
};
