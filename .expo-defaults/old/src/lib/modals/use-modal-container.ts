import { useActions, useAppState } from '@platform';
import { Modal } from '../platform/types';

export const useModalContainer = () => {
  const { modal } = useAppState();
  const { onSetModal } = useActions();

  const setActiveModal = (
    openModal: Modal['openModal'],
    withData: Modal['withData'] = {},
  ) => {
    onSetModal({
      openModal,
      withData,
    });
  };

  const clearActiveModal = () => {
    onSetModal({
      openModal: null,
      withData: {},
    });
  };

  const { openModal: activeModal, withData } = modal;
  return {
    activeModal,
    clearActiveModal,
    setActiveModal,
    withData,
  };
};
