import { createContext, useContext } from 'react';
import { initialActions, StateContextActions } from '../actions';
import { initialState, StateType } from '../state';

type StateContextType = StateType & {
  actions: StateContextActions;
};

export const StateContext = createContext<StateContextType>({
  ...initialState,
  actions: initialActions,
});

export const useStateContext = () => useContext(StateContext);
