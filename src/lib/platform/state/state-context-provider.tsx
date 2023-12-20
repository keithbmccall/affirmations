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
import {
  Action,
  initialStateContextActions,
  removeHistoryNotification,
  setCurrentlyScheduledNotifications,
  setHistoryNotification,
  setHistoryNotifications,
  setMainCalendar,
  setModal,
  setNotificationToken,
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
      onSetModal: setModal(dispatch),
    }),
    [],
  );

  useInitNotifications(providerActions, state);
  useInitEvents(providerActions, state);

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
