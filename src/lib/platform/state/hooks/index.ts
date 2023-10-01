import { useStateContext } from '../state-context-provider';

export const useActions = () => {
  return useStateContext().actions;
};
export const useAppState = () => {
  return useStateContext().app;
};
export const useNotificationToken = () => {
  return useStateContext().app.notificationToken;
};
