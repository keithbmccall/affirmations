import { ThemedButton } from '@components/shared/ThemedButton';
import { ThemedText } from '@components/shared/ThemedText';
import { ThemedView } from '@components/shared/ThemedView';
import type {
  HistoryNotification,
  NotificationIdentifier,
  NotificationWithData,
} from '@features/Affirmations/Notifications/types';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import { getHumanReadableDate } from '@utils/time';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { notificationRowConfig } from './NotificationRow/notificationRowConfig';
import { clampTranslateX, resolveSwipePositionOnEnd } from './workletGestures';

interface NotificationRowContentProps {
  notification: NotificationWithData | HistoryNotification;
}

const NotificationRowContent = memo(function NotificationRowContent({
  notification,
}: NotificationRowContentProps) {
  const { content } = notification;
  const { month, day, time } = getHumanReadableDate(new Date(content.data.triggerDate.time));

  return (
    <ThemedView style={styles.row}>
      <ThemedView style={styles.dateColumn}>
        <ThemedText
          type="subtitle"
          style={styles.dateText}
        >{`${month.slice(0, 3).toUpperCase()} ${day}`}</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.timeText}>
          {time}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.contentColumn}>
        <ThemedText type="subtitle" style={styles.titleText}>
          {content.title}
        </ThemedText>
        <ThemedText numberOfLines={1}>{content.body}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
});

interface NotificationRowProps {
  notification: NotificationWithData | HistoryNotification;
  onPress?: (identifier: NotificationIdentifier) => void;
  onDelete?: (identifier: NotificationIdentifier) => void;
}

export const NotificationRow = memo(function NotificationRow({
  notification,
  onPress,
  onDelete,
}: NotificationRowProps) {
  const { identifier } = notification;
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const testID = `notification-row-${identifier}`;
  const swipeableTestID = `swipeable-notification-row-${identifier}`;

  const translateX = useSharedValue(0);
  const isGestureActive = useSharedValue(false);
  const gestureStartX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ translateX: translateX.value }],
    }),
    []
  );

  const handleDelete = () => {
    onDelete?.(identifier);

    translateX.value = withSpring(0, notificationRowConfig.spring, () => {
      runOnJS(setIsSwipeOpen)(false);
    });
  };

  const handlePress = () => {
    // Only allow press when swipe is not open
    /* istanbul ignore next -- swipe-open + press is covered indirectly; gesture UI is partial in Jest */
    if (!isSwipeOpen && onPress) {
      onPress(identifier);
    }
  };
  const handleSimplePress = useCallback(() => {
    onPress?.(identifier);
  }, [identifier, onPress]);

  /* istanbul ignore next -- withSpring completion is validated via Reanimated mock + gesture unit tests */
  const animateToPosition = (targetPosition: number, shouldBeOpen: boolean) => {
    'worklet';
    translateX.value = withSpring(targetPosition, notificationRowConfig.spring, () => {
      runOnJS(setIsSwipeOpen)(shouldBeOpen);
    });
  };

  /* istanbul ignore next -- Pan worklet chain is covered via notification-row-gesture + product tests */
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate after 10px horizontal movement
    .failOffsetY([-20, 20]) // Fail if vertical movement exceeds 20px
    .onBegin(() => {
      'worklet';
      isGestureActive.value = true;
      gestureStartX.value = translateX.value;
    })
    .onUpdate(event => {
      'worklet';
      translateX.value = clampTranslateX(
        gestureStartX.value,
        event.translationX,
        notificationRowConfig.leftEdge,
        notificationRowConfig.rightEdge
      );
    })
    .onEnd(() => {
      'worklet';
      const { targetX, shouldBeOpen } = resolveSwipePositionOnEnd({
        translateX: translateX.value,
        gestureStartX: gestureStartX.value,
        leftEdge: notificationRowConfig.leftEdge,
        rightEdge: notificationRowConfig.rightEdge,
      });
      animateToPosition(targetX, shouldBeOpen);

      isGestureActive.value = false;
    });
  const swipeableContentStyle = useMemo(() => [styles.swipeableContent, animatedStyle], [animatedStyle]);

  if (!onDelete) {
    return onPress ? (
      <ThemedButton onPress={handleSimplePress} testID={testID}>
        <NotificationRowContent notification={notification} />
      </ThemedButton>
    ) : (
      <ThemedView testID={testID}>
        <NotificationRowContent notification={notification} />
      </ThemedView>
    );
  }

  return (
    <View style={styles.swipeableContainer} testID={swipeableTestID}>
      <View style={styles.deleteActionBackground}>
        <ThemedView style={styles.deleteAction}>
          <ThemedButton
            style={styles.deleteButton}
            onPress={handleDelete}
            testID={`delete-notification-button-${identifier}`}
          >
            <ThemedText type="defaultSemiBold" style={styles.deleteText}>
              Delete
            </ThemedText>
          </ThemedButton>
        </ThemedView>
      </View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={swipeableContentStyle}>
          {onPress ? (
            <ThemedButton onPress={handlePress} testID={testID} showPressFeedback={false}>
              <NotificationRowContent notification={notification} />
            </ThemedButton>
          ) : (
            <ThemedView testID={testID}>
              <NotificationRowContent notification={notification} />
            </ThemedView>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    ...globalStyles.flexRow,
    paddingVertical: spacing.sm,
  },
  dateColumn: {
    width: '30%',
  },
  dateText: {
    fontSize: spacing['2xl'],
    ...globalStyles.textCenter,
  },
  timeText: {
    ...globalStyles.textCenter,
  },
  contentColumn: {
    ...globalStyles.alignCenter,
    ...globalStyles.justifyCenter,
    width: '70%',
  },
  titleText: {
    fontSize: spacing['2xl'],
  },
  swipeableContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  swipeableContent: {
    backgroundColor: colors.ui.background,
  },
  deleteActionBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: notificationRowConfig.leftEdge * -1,
    zIndex: -1,
  },
  deleteAction: {
    ...globalStyles.flex1,
    ...globalStyles.justifyCenter,
    ...globalStyles.alignCenter,
    backgroundColor: colors.semantic.error,
    width: notificationRowConfig.leftEdge * -1,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    ...globalStyles.flex1,
    ...globalStyles.justifyCenter,
    ...globalStyles.alignCenter,
    width: '100%',
  },
  deleteText: {
    color: colors.ui.background,
    fontWeight: 'bold',
  },
});
