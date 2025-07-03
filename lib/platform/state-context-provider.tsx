import { useInitNotifications } from '@features/notifications';
import { noop } from '@utils';
import { createContext, FC, PropsWithChildren, useContext, useMemo, useReducer } from 'react';
import {
  Action,
  addHistoryNotification,
  AffirmationsActionsFunctions,
  removeHistoryNotification,
  setHistoryNotifications,
  setName,
  setNotificationChannels,
  setNotificationToken,
  setPendingNotifications,
  SettingsActionsFunctions,
} from './actions';
import { affirmationsReducer, settingsReducer } from './reducers';
import { initialState, StateType } from './state';

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
    onSetPendingNotifications: noop,
    onAddHistoryNotification: noop,
    onSetHistoryNotifications: noop,
    onRemoveHistoryNotification: noop,
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
        onSetPendingNotifications: setPendingNotifications(dispatch),
        //
        onAddHistoryNotification: addHistoryNotification(dispatch),
        onSetHistoryNotifications: setHistoryNotifications(dispatch),
        onRemoveHistoryNotification: removeHistoryNotification(dispatch),
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
