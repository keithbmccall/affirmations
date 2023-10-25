import { NotificationContent } from '@platform';
import { Text, makeStyles } from '@rneui/themed';
import { globalStyles } from '@theme';
import { FC } from 'react';
import { View } from 'react-native';

type NotificationCardProps = NotificationContent;
export const NotificationCard: FC<NotificationCardProps> = ({
  body,
  data: { time, date },
  title,
}) => {
  const styles = useStyles();
  const dateObject = new Date(time);
  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();
  const ampm = hours > 11 ? 'pm' : 'am';
  const displayedHours = hours > 12 ? hours - 12 : hours;
  const displayedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {`${displayedHours}:${displayedMinutes}`}
          <Text
            style={{
              fontSize: 20,
            }}
          >
            {ampm}
          </Text>
        </Text>
        <Text style={styles.dateText}>{date}</Text>
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
  dateText: {
    ...globalStyles.smallText,
    textAlign: 'center',
  },
}));
