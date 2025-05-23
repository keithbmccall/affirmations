import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { useInitEvents } from '../../notifications/hooks/use-init-events';
import { useInitNotifications } from '../../notifications/hooks/use-init-notifications';
import { useInitQuotes } from '../../notifications/hooks/use-init-quotes';
import {
  Action,
  initialStateContextActions,
  removeHistoryNotification,
  setCurrentlyScheduledNotifications,
  setFetchQuotes,
  setHistoryNotification,
  setHistoryNotifications,
  setMainCalendar,
  setModal,
  setNotificationToken,
  setSentQuoteCount,
  StateContextActions,
} from './actions';
import { initialState, stateReducer, StateType } from './reducers';

export type StateContextType = StateType & {
  actions: StateContextActions;
};

const StateContext = createContext<StateContextType>({
  ...initialState,
  actions: initialStateContextActions,
});

export const useStateContext = () => useContext(StateContext);

const rootReducer = (state: StateType, action: Action): StateType =>
  stateReducer(state, action);

export const StateContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(rootReducer, initialState);

  const providerActions: StateContextActions = useMemo(
    () => ({
      onSetNotificationToken: setNotificationToken(dispatch),
      onSetCurrentlyScheduledNotifications:
        setCurrentlyScheduledNotifications(dispatch),
      onAddHistoryNotification: setHistoryNotification(dispatch),
      onRemoveHistoryNotification: removeHistoryNotification(dispatch),
      onAddHistoryNotifications: setHistoryNotifications(dispatch),
      //
      onSetMainCalendar: setMainCalendar(dispatch),
      //
      onSetFetchQuotes: setFetchQuotes(dispatch),
      onSetSentQuoteCount: setSentQuoteCount(dispatch),
      //
      onSetModal: setModal(dispatch),
    }),
    [],
  );

  useInitNotifications(providerActions, state);
  useInitEvents(providerActions, state);
  useInitQuotes(providerActions, state);

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
