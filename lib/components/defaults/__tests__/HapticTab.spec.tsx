import { HapticTab } from '@components/defaults/HapticTab';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Text } from 'react-native';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

describe('HapticTab', () => {
  const originalExpoOs = process.env.EXPO_OS;

  afterEach(() => {
    process.env.EXPO_OS = originalExpoOs;
  });

  it('fires light impact on iOS before delegating onPressIn', () => {
    process.env.EXPO_OS = 'ios';
    const onPressIn = jest.fn();
    const { getByText } = render(
      <ThemeProvider value={DarkTheme}>
        <HapticTab
          {...({
            children: <Text>Tab</Text>,
            onPressIn,
          } as never)}
        />
      </ThemeProvider>
    );
    fireEvent(getByText('Tab'), 'pressIn');
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(onPressIn).toHaveBeenCalled();
  });

});
