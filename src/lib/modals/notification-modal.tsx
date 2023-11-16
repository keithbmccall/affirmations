import { useNotifications } from '@notifications';
import { ModalTypes } from '@platform';
import { Text } from '@rneui/themed';
import { Scheduler } from '@scheduler';
import { BottomSheet, BottomSheetProps, Icons } from '@shared-components';
import { globalStyles } from '@theme';
import { useMemo } from 'react';
import Toast from 'react-native-simple-toast';
import { VIEW_MODE } from '../components/scheduled-notifications/notification-category-options';
import { useModalContainer } from './use-modal-container';

export const NotificationModal = () => {
  const { clearActiveModal, withData, activeModal } = useModalContainer();
  const { content, identifier, viewMode } =
    withData[ModalTypes.NOTIFICATION_MODAL] ?? {};
  const { cancelPushNotification } = useNotifications();
  const isScheduledView = viewMode === VIEW_MODE.SCHEDULED;

  const dateObject = new Date(content?.data?.time ?? '');
  const hours = dateObject.getHours();
  const minutes = dateObject.getMinutes();
  const ampm = hours > 11 ? 'pm' : 'am';
  const displayedHours = hours > 12 ? hours - 12 : hours;
  const displayedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  console.log({
    content,
    identifier,
  });
  const onClose = () => {
    clearActiveModal();
  };

  const headerProps: BottomSheetProps['headerProps'] = useMemo(
    () => ({
      leadingIconProps: {
        style: { marginLeft: 4 },
        name: Icons.TRASH,
        onPress: () => {
          console.log('pressed');
          Toast.show(
            'Hold the trash icon to delete this notification',
            Toast.SHORT,
          );
        },
        onLongPress: async () => {
          if (identifier) await cancelPushNotification(identifier);
          onClose();
        },
      },
    }),
    [identifier, cancelPushNotification],
  );

  return (
    <BottomSheet
      containerStyle={{ ...globalStyles.justifyCenter }}
      headerProps={headerProps}
      isOpen={activeModal === ModalTypes.NOTIFICATION_MODAL}
      onClose={onClose}
      title="Notification details"
    >
      {content &&
        (isScheduledView ? (
          <Scheduler
            defaultTitle={content.title}
            defaultMessage={content.body}
            defaultTime={content.data.time}
            identifier={identifier}
            shouldClearOnSchedule={false}
          />
        ) : (
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
        ))}
    </BottomSheet>
  );
};
