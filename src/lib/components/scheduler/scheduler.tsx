import { MessageForm } from '@components/forms';
import { Text } from '@rneui/themed';
import { View } from 'react-native';

export const Scheduler = () => {
  return (
    <View>
      <Text
        style={{
          fontSize: 120,
        }}
      >
        11:28
      </Text>
      <MessageForm />
    </View>
  );
};
