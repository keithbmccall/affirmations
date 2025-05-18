import { ModalTypes } from '@platform';
import { NotificationModal } from './notification-modal';
import { useModalContainer } from './use-modal-container';

export const ModalContainer = () => {
  const { activeModal } = useModalContainer();
  console.log("activemodal", activeModal);
  return (
    <>
      {activeModal === ModalTypes.NOTIFICATION_MODAL && <NotificationModal />}
    </>
  );
};
