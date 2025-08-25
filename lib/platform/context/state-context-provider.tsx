import { useInitNotifications } from '@features/notifications';
import { FC, PropsWithChildren, useMemo, useReducer } from 'react';
import {
  Action,
  addHistoryNotification,
  addLensPalette,
  removeHistoryNotification,
  setHistoryNotifications,
  setLensPalettesMap,
  setLoading,
  setName,
  setNotificationChannels,
  setNotificationToken,
  setPendingNotifications,
  StateContextActions,
} from '../actions';
import { affirmationsReducer, generalReducer, lensReducer, settingsReducer } from '../reducers';
import { initialState, StateType } from '../state';
import { StateContext } from './context';

const rootReducer = (state: StateType, action: Action): StateType => {
  return {
    ...state,
    settings: settingsReducer(state.settings, action),
    affirmations: affirmationsReducer(state.affirmations, action),
    lens: lensReducer(state.lens, action),
    general: generalReducer(state.general, action),
  };
};

const StateContextProvider: FC<PropsWithChildren> = ({ children }) => {
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
      lens: {
        onAddLensPalette: addLensPalette(dispatch),
        onSetLensPalettesMap: setLensPalettesMap(dispatch),
      },
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

export default StateContextProvider;
