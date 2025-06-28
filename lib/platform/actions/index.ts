import { AffirmationsActions } from './affirmations';
import { GeneralActions } from './general';
import { LensActions } from './lens';
import { SettingsActions } from './settings';

export * from './affirmations';
export * from './general';
export * from './lens';
export * from './settings';

export type Action = SettingsActions | AffirmationsActions | LensActions | GeneralActions;
