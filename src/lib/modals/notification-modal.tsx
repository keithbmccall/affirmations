import { ModalTypes } from '@platform';
import { Text } from '@rneui/themed';
import { BottomSheet } from '@shared-components';
import { globalStyles } from '@theme';
import { useModalContainer } from './use-modal-container';

export const NotificationModal = () => {
  const { clearActiveModal, withData, activeModal } = useModalContainer();

  const content = withData[ModalTypes.NOTIFICATION_MODAL];

  const onClose = () => clearActiveModal();

  const dateObject = new Date(content?.data?.time ?? '');
  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();
  const ampm = hours > 11 ? 'pm' : 'am';
  const displayedHours = hours > 12 ? hours - 12 : hours;
  const displayedMinutes = minutes < 10 ? `0${minutes}` : minutes;

  return (
    <BottomSheet
      title="Notification"
      isOpen={activeModal === ModalTypes.NOTIFICATION_MODAL}
      onClose={onClose}
      containerStyle={{ ...globalStyles.justifyCenter }}
    >
      {content && (
        <>
          <Text style={{ fontSize: 80 }}>
            {`${displayedHours}:${displayedMinutes}`}
            <Text
              style={{
                fontSize: 20,
              }}
            >
              {ampm}
            </Text>
          </Text>
          <Text style={{ fontSize: 30 }}>{content.data.date} </Text>
          <Text
            style={{
              paddingTop: 30,
              fontSize: 50,
            }}
          >
            {content.title}
          </Text>
          <Text
            style={{
              paddingTop: 10,
              fontSize: 20,
            }}
          >
            {content.body}
          </Text>
        </>
      )}
    </BottomSheet>
  );
};
