import { ModalTypes } from '../platform/types';
import { NotificationModal } from './notification-modal';
import { useModalContainer } from './use-modal-container';

export const ModalContainer = () => {


  return (
    <>
      {<NotificationModal />}
    </>
  );
};
