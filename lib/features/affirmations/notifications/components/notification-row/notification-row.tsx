import { ThemedButton, ThemedText, ThemedView } from '@components/shared';
import {
  HistoryNotification,
  NotificationIdentifier,
  NotificationWithData,
} from '@features/affirmations/notifications';
import { colors, globalStyles, spacing } from '@styles';
import { getHumanReadableDate } from '@utils';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { NOTIFICATION_ROW_CONFIG } from './notification-row.config';

interface NotificationRowContentProps {
  notification: NotificationWithData | HistoryNotification;
}

const NotificationRowContent = ({ notification }: NotificationRowContentProps) => {
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
};

interface NotificationRowProps {
  notification: NotificationWithData | HistoryNotification;
  onPress?: (identifier: NotificationIdentifier) => void;
  onDelete?: (identifier: NotificationIdentifier) => void;
}

export const NotificationRow = ({ notification, onPress, onDelete }: NotificationRowProps) => {
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

    translateX.value = withSpring(0, NOTIFICATION_ROW_CONFIG.spring, () => {
      runOnJS(setIsSwipeOpen)(false);
    });
  };

  const handlePress = () => {
    // Only allow press when swipe is not open
    if (!isSwipeOpen && onPress) {
      onPress(identifier);
    }
  };

  const animateToPosition = (targetPosition: number, shouldBeOpen: boolean) => {
    'worklet';
    translateX.value = withSpring(targetPosition, NOTIFICATION_ROW_CONFIG.spring, () => {
      runOnJS(setIsSwipeOpen)(shouldBeOpen);
    });
  };

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
      console.log(event);
      // Calculate new position from gesture start + current translation
      translateX.value = Math.max(
        Math.min(gestureStartX.value + event.translationX, NOTIFICATION_ROW_CONFIG.rightEdge),
        NOTIFICATION_ROW_CONFIG.leftEdge
      );
    })
    .onEnd(event => {
      'worklet';

      const wasOpen = gestureStartX.value === NOTIFICATION_ROW_CONFIG.leftEdge;

      if (wasOpen) {
        if (translateX.value > -120) {
          animateToPosition(NOTIFICATION_ROW_CONFIG.rightEdge, false);
        } else {
          animateToPosition(NOTIFICATION_ROW_CONFIG.leftEdge, true);
        }
      } else {
        if (translateX.value < -40) {
          // If swiped more than 40px, open the delete action
          animateToPosition(NOTIFICATION_ROW_CONFIG.leftEdge, true);
        } else {
          // Otherwise, close it
          animateToPosition(NOTIFICATION_ROW_CONFIG.rightEdge, false);
        }
      }

      isGestureActive.value = false;
    });

  if (!onDelete) {
    return onPress ? (
      <ThemedButton onPress={() => onPress(identifier)} testID={testID}>
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
        <Animated.View style={[styles.swipeableContent, animatedStyle]}>
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
};

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
    width: NOTIFICATION_ROW_CONFIG.leftEdge * -1,
    zIndex: -1,
  },
  deleteAction: {
    ...globalStyles.flex1,
    ...globalStyles.justifyCenter,
    ...globalStyles.alignCenter,
    backgroundColor: colors.semantic.error,
    width: NOTIFICATION_ROW_CONFIG.leftEdge * -1,
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
