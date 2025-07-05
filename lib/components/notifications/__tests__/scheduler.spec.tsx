import { Scheduler } from '@components/notifications';
import { StateContextProvider } from '@platform';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const renderWithContext = (component: React.ReactNode) => {
  return render(
    <GestureHandlerRootView style={{ flex: 1, opacity: 1 }}>
      <StateContextProvider>
        <ThemeProvider value={DarkTheme}>{component}</ThemeProvider>
      </StateContextProvider>
    </GestureHandlerRootView>
  );
};

describe('Scheduler Component', () => {
  describe('Component Rendering', () => {
    it('renders all required form elements', async () => {
      const { findByRole, findByTestId } = renderWithContext(<Scheduler />);

      expect(await findByRole('header', { name: 'Date & Time' })).toBeOnTheScreen();
      expect(await findByRole('header', { name: 'Title' })).toBeOnTheScreen();
      expect(await findByRole('header', { name: 'Message' })).toBeOnTheScreen();
      expect(await findByTestId('date-time-picker')).toBeOnTheScreen();

      expect(await findByTestId('title-input')).toBeOnTheScreen();
      expect(await findByTestId('message-input')).toBeOnTheScreen();
      expect(await findByRole('button', { name: 'Schedule message' })).toBeOnTheScreen();
    });
  });
});
