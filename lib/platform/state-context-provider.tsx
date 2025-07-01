import { NotificationWithData, useInitNotifications } from '@features/notifications';
import { noop } from '@utils';
import { NotificationChannel } from 'expo-notifications';
import { createContext, FC, PropsWithChildren, useContext, useMemo, useReducer } from 'react';
import {
  Action,
  addHistoryNotification,
  AffirmationsActionsFunctions,
  setCurrentlyScheduledNotifications,
  setHistoryNotifications,
  setName,
  setNotificationChannels,
  setNotificationToken,
  SettingsActionsFunctions,
} from './actions';
import { affirmationsReducer, settingsReducer } from './reducers';

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
      currentlyScheduledNotifications: NotificationWithData[];
      historyNotifications: NotificationWithData[];
    };
  };
}
const initialState: StateType = {
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
      currentlyScheduledNotifications: [],
      historyNotifications: [],
    },
  },
};

export type StateContextActions = {
  settings: SettingsActionsFunctions;
  affirmations: AffirmationsActionsFunctions;
};

const initialActions: StateContextActions = {
  settings: {
    onSetName: noop,
  },
  affirmations: {
    onSetNotificationToken: noop,
    onSetNotificationChannels: noop,
    onSetCurrentlyScheduledNotifications: noop,
    onAddHistoryNotification: noop,
    onSetHistoryNotifications: noop,
  },
};

export type StateContextType = StateType & {
  actions: StateContextActions;
};

const StateContext = createContext<StateContextType>({
  ...initialState,
  actions: initialActions,
});

export const useStateContext = () => useContext(StateContext);

const rootReducer = (state: StateType, action: Action): StateType => {
  return {
    ...state,
    settings: settingsReducer(state.settings, action),
    affirmations: affirmationsReducer(state.affirmations, action),
    lens: state.lens,
  };
};

export const StateContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  const providerActions: StateContextActions = useMemo(
    () => ({
      settings: {
        onSetName: setName(dispatch),
      },
      affirmations: {
        onSetNotificationToken: setNotificationToken(dispatch),
        onSetNotificationChannels: setNotificationChannels(dispatch),
        onSetCurrentlyScheduledNotifications: setCurrentlyScheduledNotifications(dispatch),
        onAddHistoryNotification: addHistoryNotification(dispatch),
        onSetHistoryNotifications: setHistoryNotifications(dispatch),
      },
    }),
    []
  );

  useInitNotifications(providerActions, state);

  return (
    <StateContext.Provider
      value={{
        ...state,
        actions: providerActions,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
