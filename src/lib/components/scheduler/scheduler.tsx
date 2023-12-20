import { useNotifications } from '@notifications';
import { Maybe, NotificationIdentifier } from '@platform';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Input, Text, useTheme } from '@rneui/themed';
import { globalStyles } from '@theme';
import { fiveMinutesFromNow, january2030, rightNow, useInputRef } from '@utils';
import { FC, useState } from 'react';
import { Keyboard, View, ViewStyle } from 'react-native';
import { schedulerValidator } from './scheduler-validator';
import { useStyles } from './styles';

interface SchedulerProps {
  containerStyle?: ViewStyle;
  defaultTime?: Maybe<Date | number>;
  defaultTitle?: Maybe<string>;
  defaultMessage?: Maybe<string>;
  identifier?: Maybe<NotificationIdentifier>;
  shouldClearOnSchedule?: boolean;
}
export const Scheduler: FC<SchedulerProps> = ({
  containerStyle,
  defaultTime,
  defaultTitle,
  defaultMessage,
  identifier,
  shouldClearOnSchedule = true,
}) => {
  const [time, setTime] = useState(
    defaultTime ? new Date(defaultTime) : fiveMinutesFromNow,
  );
  const [title, setTitle] = useState(defaultTitle ?? '');
  const [message, setMessage] = useState(defaultMessage ?? '');

  const [titleError, setTitleError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [timeError, setTimeError] = useState('');

  const { schedulePushNotification, editPushNotification } = useNotifications();
  const { theme } = useTheme();
  const styles = useStyles(theme);
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
          onTimeError: setTimeError,
        },
      })
    ) {
      if (titleError) setTitleError('');
      if (messageError) setMessageError('');
      if (timeError) setTimeError('');

      Keyboard.dismiss();
      console.log(
        `Successfully scheduled with title of ${title} and message of ${message} and time of ${time}`,
      );
      if (identifier) {
        await editPushNotification(identifier, time, title, message);
        return;
      }
      await schedulePushNotification(time, title, message);
      if (shouldClearOnSchedule) {
        setTitle('');
        setMessage('');
      }
    }
  };

  return (
    <View style={containerStyle}>
      <View style={styles.dateTimePickerContainer}>
        <DateTimePicker
          display="spinner"
          minimumDate={rightNow}
          maximumDate={january2030}
          mode="datetime"
          onChange={(_, b) => {
            if (b) {
              setTime(b);
            }
          }}
          textColor={theme.colors.white}
          value={time}
        />
        <Text style={[styles.errorStyle, styles.dateTimePickerErrorStyle]}>
          {timeError}
        </Text>
      </View>

      <View style={globalStyles.justifyCenter}>
        <View style={styles.inputContainer}>
          <Input
            errorMessage={titleError}
            errorStyle={styles.errorStyle}
            onChangeText={value => {
              setTitle(value);
            }}
            placeholder="Title"
            ref={titleInput}
            value={title}
          />

          <Input
            containerStyle={styles.messageInput}
            errorMessage={messageError}
            errorStyle={styles.errorStyle}
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
          containerStyle={styles.submit}
        />
      </View>
    </View>
  );
};
