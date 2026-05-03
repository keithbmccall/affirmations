import { ThemedText } from '@components/shared/themed-text';
import { renderRouterWithContext, renderWithContext } from '@testing/render-with-context';
import { screen } from 'expo-router/testing-library';
import React from 'react';
import { Text, View } from 'react-native';

describe('renderWithContext', () => {
  it('supports disabling optional providers and adding a custom wrapper', () => {
    const Extra = ({ children }: { children: React.ReactNode }) => (
      <View testID="extra-wrap">{children}</View>
    );
    renderWithContext(<ThemedText testID="inner">Hi</ThemedText>, {
      includeGestureHandler: false,
      includeStateProvider: false,
      includeThemeProvider: false,
      wrapper: Extra,
    });
    expect(screen.getByTestId('extra-wrap')).toBeOnTheScreen();
    expect(screen.getByTestId('inner')).toBeOnTheScreen();
  });
});

describe('renderRouterWithContext', () => {
  it('wraps router renders with the shared test wrapper', () => {
    const Index = () => <Text testID="route-index">Index</Text>;
    renderRouterWithContext({ index: Index }, { includeStateProvider: false });
    expect(screen.getByTestId('route-index')).toBeOnTheScreen();
  });
});
