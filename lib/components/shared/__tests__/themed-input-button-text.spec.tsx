import { ThemedButton } from '@components/shared/themed-button';
import { ThemedInput } from '@components/shared/themed-input';
import { ThemedText } from '@components/shared/themed-text';
import { renderWithContext } from '@testing/render-with-context';
import { fireEvent, screen } from 'expo-router/testing-library';
import React from 'react';
import { Text, TextInput } from 'react-native';

describe('ThemedInput', () => {
  it('falls back to default value and applies theme colors', () => {
    const { UNSAFE_root } = renderWithContext(
      <ThemedInput testID="themed-input" placeholder="Name" />
    );
    expect(UNSAFE_root.findAllByType(TextInput).length).toBe(1);
  });
});

describe('ThemedButton', () => {
  it('supports function styles, pressed opacity, and disabling press feedback', () => {
    renderWithContext(
      <ThemedButton testID="btn-fn" style={() => ({ padding: 4 })}>
        <Text>Go</Text>
      </ThemedButton>
    );
    const btn = screen.getByTestId('btn-fn');
    fireEvent(btn, 'pressIn');
    fireEvent(btn, 'pressOut');

    renderWithContext(
      <ThemedButton testID="btn-static" style={{ padding: 2 }}>
        <Text>Static</Text>
      </ThemedButton>
    );
    fireEvent(screen.getByTestId('btn-static'), 'pressIn');

    renderWithContext(
      <ThemedButton testID="btn-no-feedback" showPressFeedback={false}>
        <Text>Quiet</Text>
      </ThemedButton>
    );
    fireEvent(screen.getByTestId('btn-no-feedback'), 'pressIn');
  });
});

describe('ThemedText', () => {
  it('supports all typography variants', () => {
    renderWithContext(
      <>
        <ThemedText testID="t-default">d</ThemedText>
        <ThemedText testID="t-title" type="title">
          t
        </ThemedText>
        <ThemedText testID="t-semibold" type="defaultSemiBold">
          s
        </ThemedText>
        <ThemedText testID="t-sub" type="subtitle">
          u
        </ThemedText>
        <ThemedText testID="t-link" type="link">
          l
        </ThemedText>
      </>
    );
    expect(screen.getByTestId('t-default')).toBeOnTheScreen();
    expect(screen.getByTestId('t-title')).toBeOnTheScreen();
    expect(screen.getByTestId('t-semibold')).toBeOnTheScreen();
    expect(screen.getByTestId('t-sub')).toBeOnTheScreen();
    expect(screen.getByTestId('t-link')).toBeOnTheScreen();
  });
});
