import { StateContextActions, StateType } from '../state';

export type Maybe<T> = T | null | undefined;

export type Init = (
  providerActions: StateContextActions,
  providerState: StateType,
) => void;
