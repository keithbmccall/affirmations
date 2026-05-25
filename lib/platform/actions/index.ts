import { noop } from '@utils/helpers';
import { AffirmationsActions, AffirmationsActionsFunctions } from './affirmations';
import { LensActions, LensActionsFunctions } from './lens';
import { SettingsActions, SettingsActionsFunctions } from './settings';

export type StateContextActions = {
  settings: SettingsActionsFunctions;
  affirmations: AffirmationsActionsFunctions;
  lens: LensActionsFunctions;
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
    onAddLensPalette: noop,
    onSetLensPalettesMap: noop,
  },
};

export * from './affirmations';
export * from './lens';
export * from './settings';

export type Action = SettingsActions | AffirmationsActions | LensActions;
