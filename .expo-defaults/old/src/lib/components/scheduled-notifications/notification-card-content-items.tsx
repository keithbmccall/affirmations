import { NotificationContent } from '@platform';
import { Text } from '@rneui/themed';
import { FC } from 'react';

interface GenericNotificationContentProps {
  body: NotificationContent['body'];
  title: NotificationContent['title'];
}
export const GenericNotificationContent: FC<
  GenericNotificationContentProps
> = ({ body, title }) => {
  return (
    <>
      {title && (
        <Text numberOfLines={1} style={{ fontSize: 30 }}>
          {title}
        </Text>
      )}
      {body && (
        <Text
          numberOfLines={1}
          style={{
            fontSize: 10,
          }}
        >
          {body}
        </Text>
      )}
    </>
  );
};
interface QuoteNotificationContentProps {
  body: NotificationContent['body'];
  author: NotificationContent['title'];
}
export const QuoteNotificationContent: FC<QuoteNotificationContentProps> = ({
  body,
  author,
}) => {
  return (
    <>
      {body && (
        <Text
          numberOfLines={1}
          style={{
            fontSize: 15,
          }}
        >
          {body}
        </Text>
      )}
      {author && (
        <Text numberOfLines={1} style={{ fontSize: 20 }}>
          {`- ${author}`}
        </Text>
      )}
    </>
  );
};
