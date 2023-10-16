import {
createContext,
FC,
PropsWithChildren,
useContext,
useMemo,
useReducer,
} from 'react';
import { useInitNotifications } from '../../notifications/use-init-notifications';
import { Action } from './actions-types';
import {
initialState,
initialStateContextActions,
setCurrentlyScheduledNotifications,
setHistoryNotifications,
setNotificationToken,
StateContextActions,
stateReducer,
StateType,
} from './reducers';

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
      onAddHistoryNotification: setHistoryNotifications(dispatch),
    }),
    [],
  );

  useInitNotifications(providerActions);

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
