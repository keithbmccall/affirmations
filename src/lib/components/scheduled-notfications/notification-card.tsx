import { NotificationRequestWithData } from '@platform';
import { makeStyles, Text } from '@rneui/themed';
import { globalStyles } from '@theme';
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
  const styles = useStyles();
  const { hours, minutes } = time;
  const ampm = hours > 11 ? 'pm' : 'am';
  const displayedHours = hours > 12 ? hours - 12 : hours;

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {`${displayedHours}:${minutes}`}
          <Text
            style={{
              fontSize: 20,
            }}
          >
            {ampm}
          </Text>
        </Text>
      </View>
      <View style={styles.descriptionContainer}>
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
export const useStyles = makeStyles((theme, props: any) => ({
  container: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  timeContainer: {
    width: '35%',
    ...globalStyles.justifyCenter,
  },
  descriptionContainer: {
    width: '65%',
    ...globalStyles.justifyCenter,
    paddingHorizontal: 20,
  },
  timeText: {
    ...globalStyles.bigText,
  },
}));
