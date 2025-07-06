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
  it('maintains tab state during re-renders', async () => {
    const { rerender } = renderWithContext(<ScheduleHistory />);

    const historyButton = await screen.findByRole('button', { name: 'History' });
    fireEvent.press(historyButton);

    // Re-render component
    rerender(<ScheduleHistory />);

    // History tab should still be selected
    expect(historyButton.props.style).toEqual(
      expect.objectContaining({ backgroundColor: colors.primary[500] })
    );
  });

  it('displays pending notifications and history notifications with correct content', async () => {
    renderWithContext(<ScheduleHistory />);

    const pendingButton = await screen.findByRole('button', { name: 'Pending' });
    const historyButton = await screen.findByRole('button', { name: 'History' });
    expect(pendingButton.props.style).toEqual(
      expect.objectContaining({ backgroundColor: colors.primary[500] })
    );
    expect(historyButton.props.style).toEqual(
      expect.not.objectContaining({ backgroundColor: colors.primary[500] })
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

    expect(historyButton.props.style).toEqual(
      expect.objectContaining({ backgroundColor: colors.primary[500] })
    );
    expect(pendingButton.props.style).toEqual(
      expect.not.objectContaining({ backgroundColor: colors.primary[500] })
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
  });
});
