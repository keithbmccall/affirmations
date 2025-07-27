export enum SCHEDULER_TYPE_VIEW_MODE {
  CUSTOM = 'CUSTOM',
  SUGGESTED = 'SUGGESTED',
}

export const schedulerTypeOptions = [
  {
    option: SCHEDULER_TYPE_VIEW_MODE.CUSTOM,
    display: 'Custom',
  },
  {
    option: SCHEDULER_TYPE_VIEW_MODE.SUGGESTED,
    display: 'Suggested',
  },
];
