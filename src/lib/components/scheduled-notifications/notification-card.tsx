import { NotificationContent, NotificationContentData } from '@platform';
import { Text } from '@rneui/themed';
import { FC } from 'react';
import { View } from 'react-native';
import {
  GenericNotificationContent,
  QuoteNotificationContent,
} from './notification-card-content-items';
import { useStyles } from './styles';

type NotificationCardProps = {
  body: NotificationContent['body'];
  data: NotificationContentData;
  title: NotificationContent['title'];
};
export const NotificationCard: FC<NotificationCardProps> = ({
  body,
  data: { time, date, isQuote },
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
    <View style={styles.cardContainer}>
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
        {isQuote ? (
          <QuoteNotificationContent body={body} author={title} />
        ) : (
          <GenericNotificationContent body={body} title={title} />
        )}
      </View>
    </View>
  );
};
