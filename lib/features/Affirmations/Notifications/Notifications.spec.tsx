import { Notifications } from '@features/Affirmations/Notifications/Notifications';
import { useAffirmations } from '@platform';
import { renderWithContext } from '@testing/renderWithContext';
import { screen } from '@testing-library/react-native';
import React, { useEffect } from 'react';

jest.mock('@features/Affirmations/Notifications/useInitNotifications', () => ({
  useInitNotifications: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: () => 48,
}));

function SeedToken({ token, children }: { token: string; children: React.ReactNode }) {
  const { onSetNotificationToken } = useAffirmations();
  useEffect(() => {
    onSetNotificationToken(token);
  }, [token, onSetNotificationToken]);
  return <>{children}</>;
}

describe('Notifications', () => {
  it('shows disabled copy when push token is missing', async () => {
    renderWithContext(<Notifications />);

    expect(await screen.findByText('Notifications are not enabled')).toBeTruthy();
  });

  it('renders scheduler and schedule history when token exists', async () => {
    renderWithContext(
      <SeedToken token="test-push-token">
        <Notifications />
      </SeedToken>
    );

    expect(await screen.findByTestId('scheduler-scroll')).toBeTruthy();
    expect(await screen.findByText('Pending')).toBeTruthy();
    expect(await screen.findByText('History')).toBeTruthy();
  });
});
