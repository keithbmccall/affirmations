import { Modal } from '@components/modal';
import { ThemedText } from '@components/shared/themed-text';
import { renderWithContext } from '@testing/render-with-context';
import { fireEvent, screen } from 'expo-router/testing-library';
import * as ExpoRouter from 'expo-router';
import React from 'react';

describe('Modal', () => {
  it('invokes router.back when the back button is enabled', async () => {
    const back = jest.spyOn(ExpoRouter.router, 'back').mockImplementation(() => {});
    renderWithContext(
      <Modal title="Test" testID="modal-title" enableBackButton>
        <ThemedText>Body</ThemedText>
      </Modal>
    );
    fireEvent.press(await screen.findByText('Back'));
    expect(back).toHaveBeenCalled();
    back.mockRestore();
  });
});
