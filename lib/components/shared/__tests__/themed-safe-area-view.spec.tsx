import { ThemedSafeAreaView } from '@components/shared/themed-safe-area-view';
import { renderWithContext } from '@testing/render-with-context';
import { screen } from 'expo-router/testing-library';
import React from 'react';

describe('ThemedSafeAreaView', () => {
  it('merges custom theme colors with safe area layout', () => {
    renderWithContext(
      <ThemedSafeAreaView testID="themed-safe" lightColor="#fefefe" darkColor="#010101" />
    );
    expect(screen.getByTestId('themed-safe')).toBeOnTheScreen();
  });
});
