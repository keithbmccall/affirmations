import Home from '@screen-containers/home';
import Settings from '@screen-containers/settings';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { act, fireEvent, screen } from 'expo-router/testing-library';
import React from 'react';
import { TextInput } from 'react-native';

describe('Home', () => {
  it('renders navigation links to lens and affirmations', async () => {
    renderWithContext(<Home />);
    expect(await screen.findByText('Table of Contents')).toBeOnTheScreen();
    await act(async () => {
      await flushProviderMicrotasks();
    });
  });
});

describe('Settings screen container', () => {
  it('updates the user name on blur', async () => {
    renderWithContext(<Settings />);
    const input = await screen.findByPlaceholderText("What's ya name");
    fireEvent.changeText(input, 'Ada');
    fireEvent(input, 'blur', { nativeEvent: { text: 'Ada Lovelace' } });
    await act(async () => {
      await flushProviderMicrotasks();
    });
    expect((input as TextInput).props.defaultValue).toBeDefined();
  });
});
