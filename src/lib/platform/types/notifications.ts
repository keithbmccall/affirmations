import { NotificationRequest } from 'expo-notifications';

type NotificationData = {
  data: {
    date: string;
    time: number;
    rawDate: string;
  };
};

type NotificationWithCustomData<T> = Omit<NotificationRequest, 'content'> & {
  content: Omit<NotificationRequest['content'], 'data'> & T;
};

export type NotificationRequestWithData =
  NotificationWithCustomData<NotificationData>;

export type NotificationContent = Omit<
  NotificationRequestWithData['content'],
  'sound' | 'subtitle'
>;

export type HistoryNotification = {
  identifier: string;
  content: NotificationContent;
};
