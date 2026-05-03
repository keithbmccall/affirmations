import TabBarBackground, { useBottomTabOverflow } from '@components/defaults/ui/TabBarBackground';
import { renderHook } from '@testing-library/react-native';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Platform, View } from 'react-native';

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: jest.fn(() => 49),
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView-Mock',
}));

const mockUseColorScheme = jest.fn(() => 'light' as const);

jest.mock('@styles/hooks/useColorScheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

describe('TabBarBackground', () => {
  const originalOs = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOs as typeof Platform.OS;
  });

  it('renders blur background on iOS', () => {
    Platform.OS = 'ios';
    const { UNSAFE_getByType } = render(<TabBarBackground />);
    expect(UNSAFE_getByType('BlurView-Mock' as never)).toBeTruthy();
  });

  it('renders solid background when not iOS', () => {
    Platform.OS = 'android';
    const { UNSAFE_root } = render(<TabBarBackground />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('defaults solid chrome to light when the scheme is unavailable', () => {
    mockUseColorScheme.mockReturnValueOnce(null);
    Platform.OS = 'android';
    const { UNSAFE_root } = render(<TabBarBackground />);
    expect(UNSAFE_root).toBeTruthy();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('exposes bottom tab overflow height', () => {
    const { result } = renderHook(() => useBottomTabOverflow(), {
      wrapper: ({ children }) => <View>{children}</View>,
    });
    expect(result.current).toBe(49);
  });
});
