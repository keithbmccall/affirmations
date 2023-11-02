import { useNotifications } from '@notifications';
import { Maybe, NotificationIdentifier } from '@platform';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Input, useTheme } from '@rneui/themed';
import { globalStyles } from '@theme';
import { fiveMinutesFromNow, rightNow, useInputRef } from '@utils';
import { FC, useState } from 'react';
import { Keyboard, View, ViewStyle } from 'react-native';
import { schedulerValidator } from './scheduler-validator';

interface SchedulerProps {
  containerStyle?: ViewStyle;
  defaultTime?: Maybe<Date | number>;
  defaultTitle?: Maybe<string>;
  defaultMessage?: Maybe<string>;
  identifier?: Maybe<NotificationIdentifier>;
}
export const Scheduler: FC<SchedulerProps> = ({
  containerStyle,
  defaultTime,
  defaultTitle,
  defaultMessage,
  identifier,
}) => {
  const [time, setTime] = useState(
    defaultTime ? new Date(defaultTime) : fiveMinutesFromNow,
  );
  const [title, setTitle] = useState(defaultTitle ?? '');
  const [message, setMessage] = useState(defaultMessage ?? '');

  const [titleError, setTitleError] = useState('');
  const [messageError, setMessageError] = useState('');

  const { schedulePushNotification, editPushNotification } = useNotifications();
  const { theme } = useTheme();
  const titleInput = useInputRef('');
  const messageInput = useInputRef('');

  const onSubmit = async () => {
    console.log(
      `Committed with title of ${title} and message of ${message} and time of ${time}`,
    );

    if (
      schedulerValidator({
        title,
        message,
        time,
        callbacks: {
          onTitleError: setTitleError,
          onMessageError: setMessageError,
          onTimeError: setMessageError,
        },
      })
    ) {
      if (titleError) setTitleError('');
      if (messageError) setMessageError('');
      setTitle('');
      setMessage('');
      Keyboard.dismiss();
      console.log(
        `Successfully scheduled with title of ${title} and message of ${message} and time of ${time}`,
      );
      if (identifier) {
        await editPushNotification(identifier, time, title, message);
        return;
      }
      await schedulePushNotification(time, title, message);
    }
  };

  return (
    <View style={containerStyle}>
      <DateTimePicker
        display="spinner"
        minimumDate={rightNow}
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
            value={title}
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
            value={message}
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
