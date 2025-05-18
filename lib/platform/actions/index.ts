import { AffirmationsActions } from './affirmations';
import { SettingsActions } from './settings';
export * from './affirmations';
export * from './settings';

export type Action = SettingsActions | AffirmationsActions;
