import { useNotifications } from '@notifications';
import { ModalTypes } from '@platform';
import { Button, Text } from '@rneui/themed';
import { Scheduler } from '@scheduler';
import { BottomSheet } from '@shared-components';
import { globalStyles } from '@theme';
import { View } from 'react-native';
import { VIEW_MODE } from '../components/scheduled-notifications/notification-category-options';
import { useModalContainer } from './use-modal-container';

export const NotificationModal = () => {
  const { clearActiveModal, withData, activeModal } = useModalContainer();
  const { content, identifier, viewMode } =
    withData[ModalTypes.NOTIFICATION_MODAL] ?? {};
  const { cancelPushNotification } = useNotifications();
  const isScheduledView = viewMode === VIEW_MODE.SCHEDULED;
  const onClose = () => clearActiveModal();

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
  return (
    <BottomSheet
      avoidKeyboard
      containerStyle={{ ...globalStyles.justifyCenter }}
      isOpen={activeModal === ModalTypes.NOTIFICATION_MODAL}
      onClose={onClose}
      title="Notification"
    >
      {content &&
        (isScheduledView ? (
          <>
            <View style={{ flexDirection: 'row' }}>
              <Button
                title="Delete"
                onPress={async () => {
                  if (identifier) await cancelPushNotification(identifier);
                }}
                containerStyle={{ paddingHorizontal: 30 }}
                buttonStyle={{
                  backgroundColor: 'brown',
                }}
              />
              <Button
                title="Edit"
                onPress={() => {}}
                containerStyle={{ paddingHorizontal: 30 }}
                buttonStyle={{
                  backgroundColor: 'blue',
                }}
              />
            </View>
            {content && (
              <Scheduler
                defaultTitle={content.title}
                defaultMessage={content.body}
                defaultTime={content.data.time}
                identifier={identifier}
              />
            )}
          </>
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
