import { useEffect } from 'react';
import { StateContextActions } from '../platform/state/reducers';
import { notificationsRegistration } from './notifications-registration';
import { useCurrentlyScheduledNotifications } from './use-currently-scheduled-notifications';

export const useInitNotifications = (providerActions: StateContextActions) => {
  const { getCurrentlyScheduledNotifications } =
    useCurrentlyScheduledNotifications();

  useEffect(() => {
    notificationsRegistration()
      .then(token => {
        if (token) {
          providerActions.onSetNotificationToken(token);
        }
        return getCurrentlyScheduledNotifications();
      })
      .then(notifications => {
        providerActions.onSetCurrentlyScheduledNotifications(notifications);
      });
  }, []);
};
