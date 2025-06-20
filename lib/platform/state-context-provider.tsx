import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import { noop } from '../utils';
import { Action } from './actions';

interface StateType {
  settings: {
    user: {
      name: string;
    };
  };
  lens: {};
  affirmations: {};
}
const initialState: StateType = {
  settings: {
    user: {
      name: '',
    },
  },
  lens: {},
  affirmations: {},
};

interface StateContextActions {
  settings: {
    onSetName: (name: string) => void;
  };
}
const initialActions: StateContextActions = {
  settings: {
    onSetName: noop,
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

export const setName =
  (dispatch: Dispatch<Action>): StateContextActions['settings']['onSetName'] =>
  name => {
    return dispatch({
      type: 'SET_NAME',
      payload: name,
    });
  };
export const stateReducer = (state = initialState, action: Action): StateType => {
  console.log({
    action,
  });
  switch (action.type) {
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
    }),
    []
  );

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
