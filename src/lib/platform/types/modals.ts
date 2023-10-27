import { NotificationContent } from '../types';

export enum ModalTypes {
  NOTIFICATION_MODAL = 'NOTIFICATION_MODAL',
}

export type Modal = {
  openModal: ModalTypes|null
  withData: {
    NOTIFICATION_MODAL?: NotificationContent;
  };
};
