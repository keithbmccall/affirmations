import { NotificationRequestWithData } from '@platform';
import { Text } from '@rneui/themed';
import { FC } from 'react';
import { View } from 'react-native';

interface NotificationCardProps {
  title: NotificationRequestWithData['content']['title'];
  body: NotificationRequestWithData['content']['body'];
  time: {
    hours: number;
    minutes: number;
  };
}
export const NotificationCard: FC<NotificationCardProps> = ({
  title,
  time,
  body,
}) => {
  const { hours, minutes } = time;

  return (
    <View
      style={{
        flexDirection: 'row',
        paddingVertical: 10,
      }}
    >
      <View
        style={{
          width: '30%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 40,
          }}
        >
          {`${hours}:${minutes}`}
        </Text>
      </View>
      <View
        style={{
          width: '70%',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            fontSize: 30,
          }}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 10,
          }}
        >
          {body}
        </Text>
      </View>
    </View>
  );
};
