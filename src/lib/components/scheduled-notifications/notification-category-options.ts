export enum VIEW_MODE {
  SCHEDULED = 'SCHEDULED',
  HISTORY = 'HISTORY',
}

export const notificationCategoryOptions = [
  {
    option: VIEW_MODE.SCHEDULED,
    display: 'Scheduled',
  },
  {
    option: VIEW_MODE.HISTORY,
    display: 'History',
  },
];
