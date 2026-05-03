import { Affirmations } from '../affirmations';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { screen } from 'expo-router/testing-library';
import * as Notifications from 'expo-notifications';
import React from 'react';

jest.mock('@react-navigation/bottom-tabs', () => ({
  ...jest.requireActual('@react-navigation/bottom-tabs'),
  useBottomTabBarHeight: jest.fn(() => 80),
}));

const mockRegister = jest.fn();
jest.mock('@features/affirmations/notifications/notifications.registration', () => ({
  registerForPushNotificationsAsync: (...args: unknown[]) => mockRegister(...args),
}));

jest.mock('@storage/storage', () => ({
  ...jest.requireActual('@storage/storage'),
  loadData: jest.fn(() => Promise.resolve([])),
  saveData: jest.fn(),
}));

describe('affirmations.tsx', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(Notifications.getAllScheduledNotificationsAsync).mockResolvedValue([]);
  });

  it('shows disabled copy when push registration yields no token', async () => {
    mockRegister.mockResolvedValue(undefined);

    renderWithContext(<Affirmations statusBarProps={{ style: 'auto' }} />);
    await flushProviderMicrotasks();

    expect(await screen.findByText('Notifications are not enabled')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Schedule message' })).not.toBeOnTheScreen();
  });

  it('shows scheduler and history when registration returns a token', async () => {
    mockRegister.mockResolvedValue('device-token');

    renderWithContext(<Affirmations statusBarProps={{ style: 'auto' }} />);
    await flushProviderMicrotasks();

    expect(await screen.findByRole('button', { name: 'Schedule message' })).toBeOnTheScreen();
    expect(await screen.findByRole('button', { name: 'Pending' })).toBeOnTheScreen();
  });
});
