import { NOTIFICATION_CATEGORY_VIEW_MODE } from '../../components/scheduled-notifications/notification-category-options';
import { Notification } from '../types';

export enum ModalTypes {
  NOTIFICATION_MODAL = 'NOTIFICATION_MODAL',
}

export type Modal = {
  openModal: ModalTypes | null;
  withData: {
    NOTIFICATION_MODAL?: Notification & { viewMode: NOTIFICATION_CATEGORY_VIEW_MODE };
  };
};
