import { useSettings } from '@platform';
import type { Action } from '../actions';
import { setName } from '../actions/settings';
import { settingsReducer } from '../reducers/settings';
import { initialState } from '../state';
import { flushProviderMicrotasks } from '@testing/flush-provider-microtasks';
import { renderWithContext } from '@testing/render-with-context';
import { act, screen } from 'expo-router/testing-library';
import React, { useEffect } from 'react';
import { Text } from 'react-native';

describe('settingsReducer', () => {
  it('returns the previous state for unrelated actions', () => {
    const prev = initialState.settings;
    const next = settingsReducer(prev, { type: 'SET_LOADING', payload: true } as Action);
    expect(next).toBe(prev);
  });
});

describe('setName', () => {
  it('dispatches SET_NAME when invoked', () => {
    const dispatch = jest.fn();
    const onSetName = setName(dispatch);
    onSetName('Pat');
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_NAME', payload: 'Pat' });
  });
});

function SetNameCaller() {
  const { onSetName, user } = useSettings();
  useEffect(() => {
    onSetName('FromEffect');
  }, [onSetName]);
  return <Text testID="user-name">{user.name}</Text>;
}

describe('settings integration', () => {
  it('applies SET_NAME through context', async () => {
    renderWithContext(<SetNameCaller />);
    await act(async () => {
      await flushProviderMicrotasks();
    });
    expect(await screen.findByTestId('user-name')).toHaveTextContent('FromEffect');
  });
});
