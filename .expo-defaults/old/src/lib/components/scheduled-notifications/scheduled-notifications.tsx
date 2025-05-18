import { useModalContainer } from '@modals';
import { useNotifications } from '@notifications';
import {
  ModalTypes,
  NotificationContent,
  NotificationIdentifier,
  useActions,
} from '@platform';
import { useTheme } from '@rneui/themed';
import { FC, useMemo, useState } from 'react';
import { FlatList, View, ViewStyle } from 'react-native';
import { RefreshControl, TouchableOpacity } from 'react-native-gesture-handler';
import { getCurrentlyScheduledNotifications } from '../../notifications/get-currently-scheduled-notifications';
import { Pill } from '../shared/pill';
import { NotificationCard } from './notification-card';
import {
  NOTIFICATION_CATEGORY_VIEW_MODE,
  notificationCategoryOptions,
} from './notification-category-options';

interface ScheduledNotificationsProps {
  containerStyle?: ViewStyle;
}
export const ScheduledNotifications: FC<ScheduledNotificationsProps> = ({
  containerStyle,
}) => {
  const { theme } = useTheme();
  const { onSetCurrentlyScheduledNotifications } = useActions();
  const { setActiveModal } = useModalContainer();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<NOTIFICATION_CATEGORY_VIEW_MODE>(NOTIFICATION_CATEGORY_VIEW_MODE.SCHEDULED);
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
      (viewMode === NOTIFICATION_CATEGORY_VIEW_MODE.SCHEDULED
        ? currentlyScheduledNotifications
        : historyNotifications
      )
        .slice()
        .reverse(),
    [currentlyScheduledNotifications, historyNotifications, viewMode],
  );

  return (
    <View style={containerStyle}>
      <Pill.Container>
        {notificationCategoryOptions.map(({ option, display }) => (
          <Pill.Option
            display={display}
            isSelected={viewMode === option}
            key={option}
            onPress={() => {
              setViewMode(option);
            }}
          />
        ))}
      </Pill.Container>
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
