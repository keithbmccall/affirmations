import { useInitNotifications } from '@features/notifications';
import { noop } from '@utils';
import { createContext, FC, PropsWithChildren, useContext, useMemo, useReducer } from 'react';
import {
  Action,
  addHistoryNotification,
  AffirmationsActionsFunctions,
  GeneralActionsFunctions,
  LensActionsFunctions,
  removeHistoryNotification,
  setHistoryNotifications,
  setLoading,
  setName,
  setNotificationChannels,
  setNotificationToken,
  setPendingNotifications,
  SettingsActionsFunctions,
} from './actions';
import { affirmationsReducer, generalReducer, lensReducer, settingsReducer } from './reducers';
import { initialState, StateType } from './state';

export type StateContextActions = {
  settings: SettingsActionsFunctions;
  affirmations: AffirmationsActionsFunctions;
  lens: LensActionsFunctions;
  general: GeneralActionsFunctions;
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
  lens: {},
  general: {
    onSetLoading: noop,
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
    lens: lensReducer(state.lens, action),
    general: generalReducer(state.general, action),
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
      lens: {},
      general: {
        onSetLoading: setLoading(dispatch),
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
