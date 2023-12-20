import { useModalContainer } from '@modals';
import { useNotifications } from '@notifications';
import {
  ModalTypes,
  NotificationContent,
  NotificationIdentifier,
  useActions,
} from '@platform';
import { Text, useTheme } from '@rneui/themed';
import { globalStyles } from '@theme';
import { FC, useMemo, useState } from 'react';
import { FlatList, View, ViewStyle } from 'react-native';
import { RefreshControl, TouchableOpacity } from 'react-native-gesture-handler';
import { getCurrentlyScheduledNotifications } from '../../notifications/get-currently-scheduled-notifications';
import { NotificationCard } from './notification-card';
import {
  VIEW_MODE,
  notificationCategoryOptions,
} from './notification-category-options';
import { useStyles } from './styles';

interface ScheduledNotificationsProps {
  containerStyle?: ViewStyle;
}
export const ScheduledNotifications: FC<ScheduledNotificationsProps> = ({
  containerStyle,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const { onSetCurrentlyScheduledNotifications } = useActions();
  const { setActiveModal } = useModalContainer();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<VIEW_MODE>(VIEW_MODE.SCHEDULED);
  const { currentlyScheduledNotifications, historyNotifications } =
    useNotifications();

  const onRefresh = async () => {
    setIsRefreshing(true);
    onSetCurrentlyScheduledNotifications(
      await getCurrentlyScheduledNotifications(),
    );
    setIsRefreshing(false);
  };

  const onPress = (
    content: NotificationContent,
    identifier: NotificationIdentifier,
  ) => {
    setActiveModal(ModalTypes.NOTIFICATION_MODAL, {
      [ModalTypes.NOTIFICATION_MODAL]: { content, identifier, viewMode },
    });
  };

  const listData = useMemo(
    () =>
      (viewMode === VIEW_MODE.SCHEDULED
        ? currentlyScheduledNotifications
        : historyNotifications
      )
        .slice()
        .reverse(),
    [currentlyScheduledNotifications, historyNotifications, viewMode],
  );

  return (
    <View style={containerStyle}>
      <View
        style={{
          flexDirection: 'row',
          borderWidth: 3,
          ...globalStyles.borderRadius10,
          borderColor: theme.colors.grey5,
        }}
      >
        {notificationCategoryOptions.map(({ option, display }) => (
          <TouchableOpacity
            key={option}
            style={styles.notificationCategoryOption}
            onPress={() => {
              setViewMode(option);
            }}
            containerStyle={[
              styles.notificationCategoryOptionContainer,
              viewMode === option && styles.selectedNotificationCategoryOption,
            ]}
          >
            <Text>{display}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={listData}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item: { identifier, content } }) => (
          <TouchableOpacity
            key={identifier}
            onPress={() => onPress(content, identifier)}
            style={{ paddingVertical: 10 }}
          >
            <NotificationCard {...content} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
