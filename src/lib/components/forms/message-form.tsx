import { useNotifications } from '@notifications';
import { Button, Input, InputProps, Text } from '@rneui/themed';
import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';

const useInputRef = () => useRef<any>();

type InputRef = InputProps & TextInput;

export const MessageForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const titleInput = useInputRef();
  const descriptionInput = useInputRef();
  const { sendPushNotification, notification, notificationToken } =
    useNotifications();

  return (
    <View
      style={{
        width: '100%',
        borderStyle: 'solid',
        borderColor: 'blue',
        borderWidth: 1,
      }}
    >
      <Text h3>{title}</Text>
      <Input
        ref={titleInput}
        onChangeText={value => {
          setTitle(value);
        }}
        placeholder="Title"
        style={{ width: '100%' }}
      />
      <Text h4>{description}</Text>
      <Input
        ref={descriptionInput}
        onChangeText={value => {
          setDescription(value);
        }}
        placeholder="Message"
      />
      <Button
        title="commit"
        onPress={() => {
          console.log(`Committed with ${title} and ${description}`);
          if (notificationToken)
            sendPushNotification({
              title: title,
              body: description,
            });
        }}
      />
    </View>
  );
};
