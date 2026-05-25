import type { HistoryNotification, NotificationWithData } from '@features/Affirmations/Notifications/types';
import type { LensPalettesMap } from '@features/Lens/ColorPalette/types';
import { NotificationChannel } from 'expo-notifications';

export interface StateType {
  settings: {
    user: {
      name: string;
    };
  };
  lens: {
    lensPalettesMap: LensPalettesMap;
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
  lens: {
    lensPalettesMap: {},
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
