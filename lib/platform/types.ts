import { StateType } from './state';
import { StateContextActions } from './state-context-provider';

export type Init = (providerActions: StateContextActions, providerState: StateType) => void;
