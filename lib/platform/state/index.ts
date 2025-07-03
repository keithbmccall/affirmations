import { HistoryNotification, NotificationWithData } from '@features/notifications';
import { NotificationChannel } from 'expo-notifications';

export interface StateType {
  settings: {
    user: {
      name: string;
    };
  };
  lens: {};
  affirmations: {
    notifications: {
      token: string;
      channels: NotificationChannel[];
      pendingNotifications: NotificationWithData[];
      historyNotifications: HistoryNotification[];
    };
  };
}
export const initialState: StateType = {
  settings: {
    user: {
      name: '',
    },
  },
  lens: {},
  affirmations: {
    notifications: {
      token: '',
      channels: [],
      pendingNotifications: [],
      historyNotifications: [],
    },
  },
};
