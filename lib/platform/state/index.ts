import { LensPalettesMap } from '@features/lens/lens-palette';
import { HistoryNotification, NotificationWithData } from '@features/notifications';
import { NotificationChannel } from 'expo-notifications';

export interface StateType {
  settings: {
    user: {
      name: string;
    };
  };
  general: {
    isLoading: boolean;
  };
  lens: {
    lensPalettes: LensPalettesMap;
  };
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
  general: {
    isLoading: false,
  },
  lens: {
    lensPalettes: {},
  },
  affirmations: {
    notifications: {
      token: '',
      channels: [],
      pendingNotifications: [],
      historyNotifications: [],
    },
  },
};
