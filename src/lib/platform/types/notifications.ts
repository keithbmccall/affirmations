import { NotificationRequest } from 'expo-notifications';

type NotificationData = {
  data: {
    date: string;
    time: number;
    rawDate: string;
    calendarEventId: string | undefined;
  };
};

type NotificationWithCustomData<T> = Omit<NotificationRequest, 'content'> & {
  content: Omit<NotificationRequest['content'], 'data'> & T;
};

export type NotificationWithData = NotificationWithCustomData<NotificationData>;

export type NotificationContent = Omit<
  NotificationWithData['content'],
  'sound' | 'subtitle'
>;

export type NotificationIdentifier = NotificationWithData['identifier'];

export type Notification = {
  identifier: NotificationIdentifier;
  content: NotificationContent;
};
export type HistoryNotification = Notification;
