export enum NOTIFICATION_CATEGORY_VIEW_MODE {
  SCHEDULED = 'SCHEDULED',
  HISTORY = 'HISTORY',
}

export const notificationCategoryOptions = [
  {
    option: NOTIFICATION_CATEGORY_VIEW_MODE.SCHEDULED,
    display: 'Scheduled',
  },
  {
    option: NOTIFICATION_CATEGORY_VIEW_MODE.HISTORY,
    display: 'History',
  },
];
