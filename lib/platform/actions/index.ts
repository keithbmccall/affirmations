import { noop } from '@utils';
import { AffirmationsActions, AffirmationsActionsFunctions } from './affirmations';
import { GeneralActions, GeneralActionsFunctions } from './general';
import { LensActions, LensActionsFunctions } from './lens';
import { SettingsActions, SettingsActionsFunctions } from './settings';

export type StateContextActions = {
  settings: SettingsActionsFunctions;
  affirmations: AffirmationsActionsFunctions;
  lens: LensActionsFunctions;
  general: GeneralActionsFunctions;
};

export const initialActions: StateContextActions = {
  settings: {
    onSetName: noop,
  },
  affirmations: {
    onSetNotificationToken: noop,
    onSetNotificationChannels: noop,
    onSetPendingNotifications: noop,
    onAddHistoryNotification: noop,
    onSetHistoryNotifications: noop,
    onRemoveHistoryNotification: noop,
  },
  lens: {
    onSetLensPalettes: noop,
  },
  general: {
    onSetLoading: noop,
  },
};

export * from './affirmations';
export * from './general';
export * from './lens';
export * from './settings';

export type Action = SettingsActions | AffirmationsActions | LensActions | GeneralActions;
