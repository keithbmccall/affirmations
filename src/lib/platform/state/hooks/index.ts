import { useStateContext } from '../state-context-provider';

export const useActions = () => {
  return useStateContext().actions;
};

export const useNotificationToken = () => {
  return useStateContext().app.notificationToken;
};
