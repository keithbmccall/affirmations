import { useNotifications } from '@notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Input, useTheme } from '@rneui/themed';
import { globalStyles } from '@theme';
import { useInputRef } from '@utils';
import { FC, useState } from 'react';
import { View, ViewStyle } from 'react-native';

export const minimumDate = new Date();

interface SchedulerProps {
  containerStyle?: ViewStyle;
}
export const Scheduler: FC<SchedulerProps> = ({ containerStyle }) => {
  const [time, setTime] = useState<Date>(new Date());
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  //
  const [titleError, setTitleError] = useState('');
  const [messageError, setMessageError] = useState('');

  const { schedulePushNotification, currentlyScheduledNotifications } =
    useNotifications();
  const { theme } = useTheme();
  const titleInput = useInputRef('');
  const messageInput = useInputRef('');

  const onSubmit = async () => {
    const timeNow = Date.now();
    const timeOfSchedule = time.getTime();
    console.log(
      `Committed with title of ${title} and message of ${message} and time of ${time}`,
    );
    let isError = false;

    if (title.length < 3) {
      isError = true;
      setTitleError('Titles need to be at least 3 characters!');
    }
    if (message.length < 8) {
      isError = true;
      setMessageError('Messages need to be at least 8 characters!');
    }

    if (timeNow > timeOfSchedule) {
      isError = true;
      setMessageError('Messages cannot be scheduled in the past!');
    }

    if (!isError) {
      if (titleError) setTitleError('');
      if (messageError) setMessageError('');
      setTitle('');
      setMessage('');
      console.log(
        `Sent with title of ${title} and message of ${message} and time of ${time}`,
      );
      await schedulePushNotification(time, title, message);
    }
  };

  return (
    <View style={containerStyle}>
      <DateTimePicker
        display="spinner"
        minimumDate={minimumDate}
        mode="datetime"
        onChange={(a, b) => {
          if (b) {
            setTime(b);
          }
        }}
        textColor={theme.colors.white}
        value={time}
      />
      <View
        style={{
          ...globalStyles.justifyCenter,
        }}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: theme.colors.grey5,
            borderRadius: 10,
            paddingTop: 15,
            paddingHorizontal: 20,
          }}
        >
          <Input
            inputContainerStyle={{ borderBottomWidth: 0 }}
            inputStyle={{ color: theme.colors.white, borderBottomWidth: 0 }}
            onChangeText={value => {
              setTitle(value);
            }}
            placeholder="Title"
            errorMessage={titleError}
            ref={titleInput}
          />

          <Input
            containerStyle={{ height: 150 }}
            errorMessage={messageError}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            multiline={true}
            numberOfLines={50}
            onChangeText={value => {
              setMessage(value);
            }}
            placeholder="Message"
            ref={messageInput}
          />
        </View>

        <Button
          title="Schedule message"
          onPress={onSubmit}
          buttonStyle={{
            backgroundColor: theme.colors.grey5,
          }}
          containerStyle={{
            width: '100%',
            borderRadius: 10,
            marginTop: 10,
          }}
        />
      </View>
    </View>
  );
};
