import { ModalTypes } from '@platform';
import { NotificationModal } from './notification-modal';
import { useModalContainer } from './use-modal-container';

export const ModalContainer = () => {
  const { activeModal } = useModalContainer();
  return (
    <>
      {activeModal === ModalTypes.NOTIFICATION_MODAL && <NotificationModal />}
    </>
  );
};
