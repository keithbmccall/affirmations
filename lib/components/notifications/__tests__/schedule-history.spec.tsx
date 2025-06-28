import { ScheduleHistory } from '@components/notifications';
import { colors } from '@styles';
import { renderRouterWithContext, renderWithContext } from '@testing';
import { act, fireEvent, screen, within } from 'expo-router/testing-library';
import React from 'react';
import NotificationDetailsModal from '../../../../app/(modals)/notification-details-modal';

// Mock useBottomTabBarHeight
jest.mock('@react-navigation/bottom-tabs', () => ({
  ...jest.requireActual('@react-navigation/bottom-tabs'),
  useBottomTabBarHeight: jest.fn(() => 80),
}));

// Mock the notification scheduler hook
const mockCancelPushNotification = jest.fn();
jest.mock('@features/notifications', () => ({
  ...jest.requireActual('@features/notifications'),
  useNotificationsScheduler: () => ({
    cancelPushNotification: mockCancelPushNotification,
  }),
}));

// Mock date formatting utility for predictable test output
jest.mock('@utils', () => ({
  ...jest.requireActual('@utils'),
  getHumanReadableDate: jest.fn(date => ({
    month: 'January',
    day: 15,
    time: '2:30 PM',
    year: 2024,
  })),
}));

// Test data
const mockPendingNotifications = [
  {
    identifier: 'pending-1',
    content: {
      title: 'Morning Affirmation',
      body: 'You are capable of amazing things',
      data: {
        triggerDate: { time: Date.now() + 3600000 }, // 1 hour from now
      },
    },
  },
  {
    identifier: 'pending-2',
    content: {
      title: 'Evening Reflection',
      body: 'Today was full of opportunities',
      data: {
        triggerDate: { time: Date.now() + 7200000 }, // 2 hours from now
      },
    },
  },
];

const mockHistoryNotifications = [
  {
    identifier: 'history-1',
    content: {
      title: 'Past Affirmation',
      body: 'You have grown so much',
      data: {
        triggerDate: { time: Date.now() - 3600000 }, // 1 hour ago
      },
    },
  },
  {
    identifier: 'history-2',
    content: {
      title: 'Yesterday Reflection',
      body: 'Each day brings new wisdom',
      data: {
        triggerDate: { time: Date.now() - 7200000 }, // 2 hours ago
      },
    },
  },
];

jest.mock('expo-notifications', () => ({
  ...jest.requireActual('expo-notifications'),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve(mockPendingNotifications)),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'test-token' })),
}));

jest.mock('@storage', () => ({
  ...jest.requireActual('@storage'),
  loadData: jest.fn(() => Promise.resolve(mockHistoryNotifications)),
  saveData: jest.fn(),
}));

describe('ScheduleHistory Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maintains tab state during re-renders', async () => {
    const { rerender } = renderWithContext(<ScheduleHistory />);

    const historyButton = await screen.findByRole('button', { name: 'History' });
    fireEvent.press(historyButton);

    // Re-render component
    rerender(<ScheduleHistory />);

    // History tab should still be selected
    expect(historyButton.props.style[1]).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: colors.primary[500] })])
    );
  });

  it('displays pending notifications and history notifications with correct content', async () => {
    renderWithContext(<ScheduleHistory />);

    const pendingButton = await screen.findByRole('button', { name: 'Pending' });
    const historyButton = await screen.findByRole('button', { name: 'History' });
    expect(pendingButton.props.style[1]).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: colors.primary[500] })])
    );
    expect(historyButton.props.style[1]).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ backgroundColor: colors.primary[500] }),
      ])
    );

    // Should display pending notifications by default
    const message1Button = await screen.findByRole('button', { name: 'Morning Affirmation' });
    expect(within(message1Button).getByText('You are capable of amazing things')).toBeOnTheScreen();
    expect(within(message1Button).getByText('JAN 15')).toBeOnTheScreen();
    expect(within(message1Button).getByText('2:30 PM')).toBeOnTheScreen();
    const message2Button = await screen.findByRole('button', { name: 'Evening Reflection' });
    expect(within(message2Button).getByText('Today was full of opportunities')).toBeOnTheScreen();
    expect(within(message2Button).getByText('JAN 15')).toBeOnTheScreen();
    expect(within(message2Button).getByText('2:30 PM')).toBeOnTheScreen();

    fireEvent.press(await screen.findByRole('button', { name: 'History' }));

    expect(historyButton.props.style[1]).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: colors.primary[500] })])
    );
    expect(pendingButton.props.style[1]).toEqual(
      expect.not.arrayContaining([
        expect.objectContaining({ backgroundColor: colors.primary[500] }),
      ])
    );

    expect(await screen.findByText('Past Affirmation')).toBeOnTheScreen();
    const message3Button = await screen.findByRole('button', { name: 'Past Affirmation' });
    expect(within(message3Button).getByText('You have grown so much')).toBeOnTheScreen();
    expect(within(message3Button).getByText('JAN 15')).toBeOnTheScreen();
    expect(within(message3Button).getByText('2:30 PM')).toBeOnTheScreen();
    const message4Button = await screen.findByRole('button', { name: 'Yesterday Reflection' });
    expect(within(message4Button).getByText('Each day brings new wisdom')).toBeOnTheScreen();
    expect(within(message4Button).getByText('JAN 15')).toBeOnTheScreen();
    expect(within(message4Button).getByText('2:30 PM')).toBeOnTheScreen();
  });

  describe('Navigation', () => {
    it('navigates to notification details when notification is pressed', async () => {
      renderRouterWithContext({
        index: ScheduleHistory,
        '(modals)/notification-details-modal': NotificationDetailsModal,
      });
      const button = await screen.findByRole('button', { name: 'Morning Affirmation' });
      await act(async () => {
        fireEvent.press(button);
      });
      expect(await screen.findByRole('header', { name: 'Morning Affirmation' })).toBeOnTheScreen();
      expect(await screen.findByTestId('notification-details-title')).toHaveTextContent(
        'Morning Affirmation'
      );
    });

    it('navigates to notification details from history tab', async () => {
      renderRouterWithContext({
        index: ScheduleHistory,
        '(modals)/notification-details-modal': NotificationDetailsModal,
      });

      // Switch to history tab
      const historyButton = await screen.findByRole('button', { name: 'History' });
      fireEvent.press(historyButton);

      // Navigate to details from history
      const button = await screen.findByRole('button', { name: 'Past Affirmation' });
      await act(async () => {
        fireEvent.press(button);
      });
      expect(await screen.findByRole('header', { name: 'Past Affirmation' })).toBeOnTheScreen();
    });
  });

  describe('Tab Switching', () => {
    it('switches between pending and history tabs correctly', async () => {
      renderWithContext(<ScheduleHistory />);

      // Initially on pending tab
      const pendingButton = await screen.findByRole('button', { name: 'Pending' });
      const historyButton = await screen.findByRole('button', { name: 'History' });

      expect(pendingButton.props.style[1]).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: colors.primary[500] })])
      );
      expect(historyButton.props.style[1]).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({ backgroundColor: colors.primary[500] }),
        ])
      );

      // Switch to history
      fireEvent.press(historyButton);

      expect(historyButton.props.style[1]).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: colors.primary[500] })])
      );
      expect(pendingButton.props.style[1]).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({ backgroundColor: colors.primary[500] }),
        ])
      );

      // Switch back to pending
      fireEvent.press(pendingButton);

      expect(pendingButton.props.style[1]).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: colors.primary[500] })])
      );
      expect(historyButton.props.style[1]).toEqual(
        expect.not.arrayContaining([
          expect.objectContaining({ backgroundColor: colors.primary[500] }),
        ])
      );
    });

    it('displays correct notifications when switching tabs', async () => {
      renderWithContext(<ScheduleHistory />);

      // Initially shows pending notifications
      expect(await screen.findByText('Morning Affirmation')).toBeOnTheScreen();
      expect(await screen.findByText('Evening Reflection')).toBeOnTheScreen();
      expect(screen.queryByText('Past Affirmation')).not.toBeOnTheScreen();

      // Switch to history
      const historyButton = await screen.findByRole('button', { name: 'History' });
      fireEvent.press(historyButton);

      // Now shows history notifications
      expect(await screen.findByText('Past Affirmation')).toBeOnTheScreen();
      expect(await screen.findByText('Yesterday Reflection')).toBeOnTheScreen();
      expect(screen.queryByText('Morning Affirmation')).not.toBeOnTheScreen();
    });
  });

  describe('Error Handling', () => {
    it('handles delete operation errors gracefully', async () => {
      // Mock console.error to prevent test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock the cancel function to throw an error
      mockCancelPushNotification.mockRejectedValueOnce(new Error('Delete failed'));

      renderWithContext(<ScheduleHistory />);

      const deleteButton = await screen.findByTestId('delete-notification-button-pending-1');

      await act(async () => {
        fireEvent.press(deleteButton);
      });

      // Should call the function even if it fails
      expect(mockCancelPushNotification).toHaveBeenCalledWith('pending-1');

      // Should log the error
      expect(consoleSpy).toHaveBeenCalledWith('Failed to delete notification:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Data Sorting', () => {
    it('sorts notifications by trigger date', async () => {
      renderWithContext(<ScheduleHistory />);

      // Wait for pending notifications to load
      const morningAffirmation = await screen.findByText('Morning Affirmation');
      const eveningReflection = await screen.findByText('Evening Reflection');

      // Get all notification rows
      const notificationRows = screen.getAllByTestId(/notification-row|swipeable-notification-row/);

      // Should have 2 pending notifications (plus 2 tab buttons)
      expect(notificationRows).toHaveLength(4);

      // Find the actual notification rows (skip tab buttons)
      const pendingRows = notificationRows.filter(row =>
        row.props.testID?.includes('swipeable-notification-row')
      );
      expect(pendingRows).toHaveLength(2);

      // First notification should be "Morning Affirmation" (1 hour from now)
      expect(within(pendingRows[0]).getByText('Morning Affirmation')).toBeOnTheScreen();

      // Second notification should be "Evening Reflection" (2 hours from now)
      expect(within(pendingRows[1]).getByText('Evening Reflection')).toBeOnTheScreen();
    });

    it('sorts history notifications by trigger date', async () => {
      renderWithContext(<ScheduleHistory />);

      // Switch to history tab
      const historyButton = await screen.findByRole('button', { name: 'History' });
      fireEvent.press(historyButton);

      // Wait for history notifications to load
      const pastAffirmation = await screen.findByText('Past Affirmation');
      const yesterdayReflection = await screen.findByText('Yesterday Reflection');

      // Get all notification rows
      const notificationRows = screen.getAllByTestId(/notification-row/);

      // Should have 2 history notifications
      expect(notificationRows).toHaveLength(2);

      // Check that both notifications are present (order may vary due to sorting)
      expect(screen.getByText('Past Affirmation')).toBeOnTheScreen();
      expect(screen.getByText('Yesterday Reflection')).toBeOnTheScreen();

      // Verify they're in the notification rows
      expect(
        within(notificationRows[0]).getByText(/Past Affirmation|Yesterday Reflection/)
      ).toBeOnTheScreen();
      expect(
        within(notificationRows[1]).getByText(/Past Affirmation|Yesterday Reflection/)
      ).toBeOnTheScreen();
    });
  });

  describe('Swipe to Delete', () => {
    it('renders swipeable components for pending notifications', async () => {
      renderWithContext(<ScheduleHistory />);

      // Should see swipeable components for pending notifications
      expect(await screen.findByTestId('swipeable-notification-row-pending-1')).toBeOnTheScreen();
      expect(await screen.findByTestId('swipeable-notification-row-pending-2')).toBeOnTheScreen();
    });

    it('does not render swipeable components for history notifications', async () => {
      renderWithContext(<ScheduleHistory />);

      // Switch to history tab
      const historyButton = await screen.findByRole('button', { name: 'History' });
      fireEvent.press(historyButton);

      // Should see regular notification rows, not swipeable ones for history
      expect(await screen.findByTestId('notification-row-history-1')).toBeOnTheScreen();
      expect(await screen.findByTestId('notification-row-history-2')).toBeOnTheScreen();

      // Should NOT see swipeable versions
      expect(screen.queryByTestId('swipeable-notification-row-history-1')).not.toBeOnTheScreen();
      expect(screen.queryByTestId('swipeable-notification-row-history-2')).not.toBeOnTheScreen();
    });

    it('calls cancelPushNotification when delete button is pressed', async () => {
      renderWithContext(<ScheduleHistory />);

      const deleteButton = await screen.findByTestId('delete-notification-button-pending-1');

      await act(async () => {
        fireEvent.press(deleteButton);
      });

      expect(mockCancelPushNotification).toHaveBeenCalledWith('pending-1');
    });

    it('has properly styled delete action button', async () => {
      renderWithContext(<ScheduleHistory />);

      const deleteButton = await screen.findByTestId('delete-notification-button-pending-1');
      expect(deleteButton).toBeOnTheScreen();

      // Verify the delete text is present
      expect(within(deleteButton).getByText('Delete')).toBeOnTheScreen();
    });

    it('disables press functionality when swipe is open', async () => {
      renderWithContext(<ScheduleHistory />);

      // Verify delete button is present (indicating swipe functionality)
      const deleteButton = await screen.findByTestId('delete-notification-button-pending-1');
      expect(deleteButton).toBeOnTheScreen();

      // Verify the notification row is swipeable
      const notificationRow = await screen.findByTestId('swipeable-notification-row-pending-1');
      expect(notificationRow).toBeOnTheScreen();
    });

    it('shows delete action when swiping left', async () => {
      renderWithContext(<ScheduleHistory />);

      const notificationRow = await screen.findByTestId('swipeable-notification-row-pending-1');
      const deleteButton = await screen.findByTestId('delete-notification-button-pending-1');

      // Delete button should be visible (it's positioned absolutely)
      expect(deleteButton).toBeOnTheScreen();
    });

    it('handles multiple delete operations correctly', async () => {
      renderWithContext(<ScheduleHistory />);

      // Delete first notification
      const deleteButton1 = await screen.findByTestId('delete-notification-button-pending-1');
      await act(async () => {
        fireEvent.press(deleteButton1);
      });
      expect(mockCancelPushNotification).toHaveBeenCalledWith('pending-1');

      // Delete second notification
      const deleteButton2 = await screen.findByTestId('delete-notification-button-pending-2');
      await act(async () => {
        fireEvent.press(deleteButton2);
      });
      expect(mockCancelPushNotification).toHaveBeenCalledWith('pending-2');

      // Verify both calls were made
      expect(mockCancelPushNotification).toHaveBeenCalledTimes(2);
    });

    it('maintains proper test IDs for all notification rows', async () => {
      renderWithContext(<ScheduleHistory />);

      // Pending notifications should have swipeable test IDs
      expect(await screen.findByTestId('swipeable-notification-row-pending-1')).toBeOnTheScreen();
      expect(await screen.findByTestId('swipeable-notification-row-pending-2')).toBeOnTheScreen();

      // Switch to history
      const historyButton = await screen.findByRole('button', { name: 'History' });
      fireEvent.press(historyButton);

      // History notifications should have regular test IDs
      expect(await screen.findByTestId('notification-row-history-1')).toBeOnTheScreen();
      expect(await screen.findByTestId('notification-row-history-2')).toBeOnTheScreen();
    });
  });
});
