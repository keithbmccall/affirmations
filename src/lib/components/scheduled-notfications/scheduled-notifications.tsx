import { useModalContainer } from '@modals';
import { useNotifications } from '@notifications';
import { useActions } from '@platform';
import { Text, makeStyles, useTheme } from '@rneui/themed';
import { globalStyles } from '@theme';
import { FC, useState } from 'react';
import { RefreshControl, ScrollView, View, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ModalTypes } from '../../platform/types';
import { NotificationCard } from './notification-card';

enum VIEW_MODE {
  SCHEDULED = 'SCHEDULED',
  HISTORY = 'HISTORY',
}
interface ScheduledNotificationsProps {
  containerStyle?: ViewStyle;
}
export const ScheduledNotifications: FC<ScheduledNotificationsProps> = ({
  containerStyle,
}) => {
  const { theme } = useTheme();

  const { setActiveModal } = useModalContainer();
  const [viewMode, setViewMode] = useState<VIEW_MODE>(VIEW_MODE.SCHEDULED);
  const styles = useStyles(theme);
  const {
    currentlyScheduledNotifications,
    getCurrentlyScheduledNotifications,
    historyNotifications,
  } = useNotifications();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { onSetCurrentlyScheduledNotifications } = useActions();

  const onRefresh = async () => {
    setIsRefreshing(true);
    onSetCurrentlyScheduledNotifications(
      await getCurrentlyScheduledNotifications(),
    );
    setIsRefreshing(false);
  };

  return (
    <View style={containerStyle}>
      <View
        style={{
          flexDirection: 'row',
          borderWidth: 3,
          borderRadius: 10,
          borderColor: theme.colors.grey5,
        }}
      >
        <TouchableOpacity
          style={{
            padding: 10,
          }}
          onPress={() => {
            setViewMode(VIEW_MODE.SCHEDULED);
          }}
          containerStyle={[
            styles.notificationCategoryOption,
            viewMode === VIEW_MODE.SCHEDULED &&
              styles.selectedNotificationCategoryOption,
          ]}
        >
          <Text>Scheduled</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            padding: 10,
          }}
          onPress={() => {
            setViewMode(VIEW_MODE.HISTORY);
          }}
          containerStyle={[
            styles.notificationCategoryOption,
            viewMode === VIEW_MODE.HISTORY &&
              styles.selectedNotificationCategoryOption,
          ]}
        >
          <Text>History</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {viewMode === VIEW_MODE.SCHEDULED
          ? currentlyScheduledNotifications?.map(({ identifier, content }) => {
              const onPress = () => {
                setActiveModal(ModalTypes.NOTIFICATION_MODAL, {
                  [ModalTypes.NOTIFICATION_MODAL]: content,
                });
              };
              return (
                <TouchableOpacity
                  key={identifier}
                  onPress={onPress}
                  style={{ paddingVertical: 10 }}
                >
                  <NotificationCard {...content} />
                </TouchableOpacity>
              );
            })
          : historyNotifications?.map(({ identifier, content }) => {
              const onPress = () => {
                setActiveModal(ModalTypes.NOTIFICATION_MODAL, {
                  [ModalTypes.NOTIFICATION_MODAL]: content,
                });
              };
              return (
                <TouchableOpacity
                  key={identifier}
                  onPress={onPress}
                  style={{ paddingVertical: 10 }}
                >
                  <NotificationCard {...content} />
                </TouchableOpacity>
              );
            })}
      </ScrollView>
    </View>
  );
};
export const useStyles = makeStyles((theme, props: any) => ({
  notificationCategoryOption: {
    width: '50%',
    ...globalStyles.justifyCenter,
  },
  selectedNotificationCategoryOption: {
    borderStyle: 'solid',
    borderColor: theme.colors.grey5,
    backgroundColor: theme.colors.grey5,
  },
}));
