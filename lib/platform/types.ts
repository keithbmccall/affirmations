import { StateContextActions, StateType } from './state-context-provider';

export type Init = (providerActions: StateContextActions, providerState: StateType) => void;
