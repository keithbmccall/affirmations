import { NotificationRequest as BaseNotificationRequest } from 'expo-notifications';
/**
 * NotificationRequest fields:
 * @property {string} identifier - Unique identifier for the notification
 * @property {NotificationTriggerInput} trigger - When the notification should be triggered
 * @property {Object} content - Notification content
 * @property {string} [content.title] - Notification title
 * @property {string} [content.body] - Notification message
 * @property {any} [content.data] - Custom data
 * @property {string} [content.sound] - Sound to play
 * @property {number} [content.badge] - Badge count
 * @property {string} [content.categoryIdentifier] - Category for grouping
 * @property {string} [content.subtitle] - Subtitle text
 * @property {NotificationPriority} [content.priority] - Priority level
 * @property {boolean} [content.sticky] - Whether notification is sticky
 * @property {boolean} [content.autoDismiss] - Auto-dismiss behavior
 * @property {NotificationAttachment[]} [content.attachments] - Array of media attachments
 */
export type NotificationRequest = BaseNotificationRequest;

export type NotificationDateObject = {
  time: number;
  rawDate: string;
  date: string;
};

export type NotificationData = {
  data: {
    scheduledDate: NotificationDateObject;
    triggerDate: NotificationDateObject;
  };
};

type NotificationWithCustomData<T> = Omit<NotificationRequest, 'content'> & {
  content: Omit<NotificationRequest['content'], 'data'> & T;
};

export type NotificationWithData = NotificationWithCustomData<NotificationData>;

export type NotificationContent = Omit<NotificationWithData['content'], 'sound' | 'subtitle'>;
export type NotificationContentData = NotificationContent['data'];

export type NotificationIdentifier = NotificationWithData['identifier'];

export type Notification = {
  identifier: NotificationIdentifier;
  content: NotificationContent;
};
export type HistoryNotification = Notification;
