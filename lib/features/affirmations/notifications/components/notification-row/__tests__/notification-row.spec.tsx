import type { NotificationWithData } from '@features/affirmations/notifications/types';
import { NotificationRow } from '../notification-row';
import { renderWithContext } from '@testing/render-with-context';
import { fireEvent, screen } from 'expo-router/testing-library';
import React from 'react';

jest.mock('@utils/time', () => ({
  ...jest.requireActual('@utils/time'),
  getHumanReadableDate: jest.fn(() => ({
    month: 'January',
    day: 15,
    time: '2:30 PM',
    year: 2024,
  })),
}));

const baseNotification: NotificationWithData = {
  identifier: 'row-int-1',
  content: {
    title: 'Int Title',
    body: 'Int body line',
    data: {
      scheduledDate: { time: 1, rawDate: '', date: '' },
      triggerDate: { time: Date.now() + 60_000, rawDate: '', date: '' },
    },
    categoryIdentifier: 'affirmation',
  },
};

describe('notification-row.tsx', () => {
  it('renders read-only row when neither onDelete nor onPress is provided', async () => {
    renderWithContext(<NotificationRow notification={baseNotification} />);

    expect(await screen.findByTestId('notification-row-row-int-1')).toBeOnTheScreen();
    expect(screen.queryByTestId('swipeable-notification-row-row-int-1')).not.toBeOnTheScreen();
  });

  it('invokes onPress when only press handler is provided', async () => {
    const onPress = jest.fn();
    renderWithContext(<NotificationRow notification={baseNotification} onPress={onPress} />);

    fireEvent.press(await screen.findByTestId('notification-row-row-int-1'));
    expect(onPress).toHaveBeenCalledWith('row-int-1');
  });

  it('renders swipe row with delete only (no row press handler)', async () => {
    const onDelete = jest.fn();
    renderWithContext(<NotificationRow notification={baseNotification} onDelete={onDelete} />);

    expect(await screen.findByTestId('swipeable-notification-row-row-int-1')).toBeOnTheScreen();
    expect(screen.queryByTestId('notification-row-row-int-1')).toBeTruthy();
  });
});
