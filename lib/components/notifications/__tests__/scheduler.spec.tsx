import { Scheduler } from '@components/notifications';
import { render } from '@testing-library/react-native';
import React from 'react';

describe('Scheduler Component', () => {
  describe('Component Rendering', () => {
    it('renders all required form elements', () => {
      const { getByPlaceholderText, getByTestId, getByText } = render(<Scheduler />);

      expect(getByText('Date & Time')).toBeTruthy();
      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Message')).toBeTruthy();
      expect(getByPlaceholderText('Enter message title')).toBeTruthy();
      expect(getByPlaceholderText('Enter your message')).toBeTruthy();
      expect(getByText('Schedule message')).toBeTruthy();
    });
  });
});
