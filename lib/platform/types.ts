import { StateContextActions } from './actions';
import { StateType } from './state';

export type Init = (providerActions: StateContextActions, providerState: StateType) => void;
