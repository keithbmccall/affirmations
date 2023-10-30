import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { useInitNotifications } from '../../notifications/hooks/use-init-notifications';
import {
  initialStateContextActions,
  removeHistoryNotification,
  setCurrentlyScheduledNotifications,
  setHistoryNotification,
  setHistoryNotifications,
  setModal,
  setNotificationToken,
  StateContextActions,
} from './actions';
import { Action } from './actions/action-types';
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
      onSetModal: setModal(dispatch),
    }),
    [],
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
