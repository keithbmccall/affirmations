import { NotificationChannel } from 'expo-notifications';
import { createContext, FC, PropsWithChildren, useContext, useMemo, useReducer } from 'react';
import { useInitNotifications } from '../notifications';
import { noop } from '../utils';
import {
  Action,
  AffirmationsActionsFunctions,
  setName,
  setNotificationChannels,
  setNotificationToken,
  SettingsActionsFunctions,
} from './actions';

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

export const stateReducer = (state = initialState, action: Action): StateType => {
  console.log({
    action,
  });
  switch (action.type) {
    // settings
    case 'SET_NAME':
      return {
        ...state,
        settings: {
          ...state.settings,
          user: {
            name: action.payload,
          },
        },
      };
    // affirmations
    case 'SET_NOTIFICATION_TOKEN':
      return {
        ...state,
        affirmations: {
          ...state.affirmations,
          notifications: {
            ...state.affirmations.notifications,
            token: action.payload,
          },
        },
      };
    case 'SET_NOTIFICATION_CHANNELS':
      return {
        ...state,
        affirmations: {
          ...state.affirmations,
          notifications: {
            ...state.affirmations.notifications,
            channels: action.payload,
          },
        },
      };
    default:
      return state;
  }
};

const rootReducer = (state: StateType, action: Action): StateType => stateReducer(state, action);

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
