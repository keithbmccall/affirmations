import { NotificationRequest } from 'expo-notifications';

type NotificationData = {
  data: {
    date: string;
    time: string;
    rawDate: string;
  };
};

type NotificationWithCustomData<T> = Omit<NotificationRequest, 'content'> & {
  content: Omit<NotificationRequest['content'], 'data'> & T;
};

export type NotificationRequestWithData =
  NotificationWithCustomData<NotificationData>;
