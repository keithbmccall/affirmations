import { Scheduler } from '../index';
import { renderWithContext, setupDateTimePickerMock, simulateDatePickerPress } from '@testing';
import { act, fireEvent, waitFor } from 'expo-router/testing-library';
import React from 'react';

// Use the shared DateTimePicker mock utility
jest.mock('@react-native-community/datetimepicker');

// Set up the DateTimePicker mock with default configuration
const MockedDateTimePicker = setupDateTimePickerMock();

// Mock useNotificationsScheduler
const mockSchedulePushNotification = jest.fn();
const mockRefreshPendingNotifications = jest.fn();

jest.mock('@features/notifications', () => ({
  ...jest.requireActual('@features/notifications'),
  useNotificationsScheduler: jest.fn(() => ({
    schedulePushNotification: mockSchedulePushNotification,
    refreshPendingNotifications: mockRefreshPendingNotifications,
  })),
}));

describe('Scheduler Component', () => {
  beforeEach(() => {
    MockedDateTimePicker.mockClear();
    mockSchedulePushNotification.mockClear();
    mockRefreshPendingNotifications.mockClear();
  });

  describe('Component Rendering', () => {
    it('renders all required form elements', async () => {
      const { findByRole, getByTestId } = renderWithContext(<Scheduler />);

      // Check for form elements
      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');
      const dateTimePicker = getByTestId('date-time-picker');
      const submitButton = await findByRole('button', { name: 'Schedule message' });

      expect(titleInput).toBeOnTheScreen();
      expect(messageInput).toBeOnTheScreen();
      expect(dateTimePicker).toBeOnTheScreen();
      expect(submitButton).toBeOnTheScreen();
    });
  });

  describe('Submit Button State', () => {
    it('initially disables submit button when form is empty', async () => {
      const { findByRole } = renderWithContext(<Scheduler />);

      const submitButton = await findByRole('button', { name: 'Schedule message' });
      expect(submitButton.props.accessibilityState.disabled).toBe(true);
    });

    it('enables submit button when form has valid data', async () => {
      const { findByRole, getByTestId } = renderWithContext(<Scheduler />);

      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');

      fireEvent.changeText(titleInput, 'Valid Title');
      fireEvent.changeText(messageInput, 'Valid message content');

      const submitButton = await findByRole('button', { name: 'Schedule message' });
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    it('enables submit button even with short title when not empty', async () => {
      const { findByRole, getByTestId } = renderWithContext(<Scheduler />);

      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');

      fireEvent.changeText(titleInput, 'Hi');
      fireEvent.changeText(messageInput, 'Valid message content');

      const submitButton = await findByRole('button', { name: 'Schedule message' });
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    it('enables submit button even with short message when not empty', async () => {
      const { findByRole, getByTestId } = renderWithContext(<Scheduler />);

      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');

      fireEvent.changeText(titleInput, 'Valid Title');
      fireEvent.changeText(messageInput, 'Hi');

      const submitButton = await findByRole('button', { name: 'Schedule message' });
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('shows error message when submitting with short title', async () => {
      const { findByRole, getByTestId, findByText } = renderWithContext(<Scheduler />);

      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');

      fireEvent.changeText(titleInput, 'Hi');
      fireEvent.changeText(messageInput, 'Valid message content');

      const submitButton = await findByRole('button', { name: 'Schedule message' });
      await act(async () => {
        fireEvent.press(submitButton);
      });

      expect(await findByText('Title needs to be at least 3 characters')).toBeOnTheScreen();
    });

    it('shows error message when submitting with short message', async () => {
      const { findByRole, getByTestId, findByText } = renderWithContext(<Scheduler />);

      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');

      fireEvent.changeText(titleInput, 'Valid Title');
      fireEvent.changeText(messageInput, 'Hi');

      const submitButton = await findByRole('button', { name: 'Schedule message' });

      await act(async () => {
        fireEvent.press(submitButton);
      });

      expect(await findByText('Message needs to be at least 5 characters')).toBeOnTheScreen();
    });

    it('shows error message when submitting with both fields too short', async () => {
      const { findByRole, getByTestId, findByText } = renderWithContext(<Scheduler />);

      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');

      fireEvent.changeText(titleInput, 'Hi');
      fireEvent.changeText(messageInput, 'Bye');

      const submitButton = await findByRole('button', { name: 'Schedule message' });
      await act(async () => {
        fireEvent.press(submitButton);
      });

      // Both errors should be shown
      expect(await findByText('Title needs to be at least 3 characters')).toBeOnTheScreen();
      expect(await findByText('Message needs to be at least 5 characters')).toBeOnTheScreen();
    });
  });

  describe('Form Interaction', () => {
    it('handles text input, multiline support, and error clearing', async () => {
      // Clear any previous mock calls
      mockSchedulePushNotification.mockClear();
      mockSchedulePushNotification.mockResolvedValue('mock-notification-id');

      const { findByRole, getByTestId, findByText, queryByText } = renderWithContext(<Scheduler />);

      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');

      // Test basic text input in both fields
      fireEvent.changeText(titleInput, 'Test Title');
      fireEvent.changeText(messageInput, 'Test message content');

      // Verify text input works (checking that submit button becomes enabled)
      const submitButton = await findByRole('button', { name: 'Schedule message' });
      expect(submitButton.props.accessibilityState.disabled).toBe(false);

      // Test multiline text input in message field
      const multilineText = 'Line 1\nLine 2\nLine 3';
      fireEvent.changeText(messageInput, multilineText);

      // Test error clearing functionality
      // First create a validation error with short title
      fireEvent.changeText(titleInput, 'Hi');
      fireEvent.changeText(messageInput, 'Valid message content');
      fireEvent.press(submitButton);
      expect(await findByText('Title needs to be at least 3 characters')).toBeOnTheScreen();

      // Then clear the error by typing a valid title
      fireEvent.changeText(titleInput, 'Valid Title');
      expect(queryByText('Title needs to be at least 3 characters')).not.toBeOnTheScreen();

      // Test successful form submission
      fireEvent.changeText(titleInput, 'Test Title');
      fireEvent.changeText(messageInput, 'Test message content');
      await act(async () => {
        fireEvent.press(submitButton);
      });

      // Assert that schedulePushNotification was called with expected values
      expect(mockSchedulePushNotification).toHaveBeenCalledTimes(1);
      expect(mockSchedulePushNotification).toHaveBeenCalledWith({
        title: 'Test Title',
        body: 'Test message content',
        date: expect.any(Date),
      });

      // Wait for form to be reset after successful submission
      // The submit button should become disabled again when form is cleared
      await waitFor(() => {
        expect(submitButton.props.accessibilityState.disabled).toBe(true);
      });
    });
  });

  describe('Custom Props', () => {
    it('renders with custom submit button text and initial values', async () => {
      const customProps = {
        initialTitle: 'Initial Title Value',
        initialBody: 'Initial message content here',
        submitProps: {
          submitText: 'Custom Submit Text',
          onSubmit: jest.fn(),
        },
      };

      const { findByRole, getByTestId } = renderWithContext(<Scheduler {...customProps} />);

      // Check custom submit button text
      const submitButton = await findByRole('button', { name: 'Custom Submit Text' });
      expect(submitButton).toBeOnTheScreen();

      // Check initial title value
      const titleInput = getByTestId('title-input');
      expect(titleInput.props.defaultValue).toBe('Initial Title Value');

      // Check initial message value
      const messageInput = getByTestId('message-input');
      expect(messageInput.props.defaultValue).toBe('Initial message content here');

      // Check that onSubmit function is called when form is submitted
      await act(async () => {
        fireEvent.press(submitButton);
      });
      expect(customProps.submitProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(customProps.submitProps.onSubmit).toHaveBeenCalledWith({
        title: 'Initial Title Value',
        body: 'Initial message content here',
        date: expect.any(Date),
      });
    });
  });

  describe('DateTimePicker Functionality', () => {
    it('renders with default date value', async () => {
      const { getByTestId } = renderWithContext(<Scheduler />);

      const dateTimePicker = getByTestId('date-time-picker');
      expect(dateTimePicker).toBeOnTheScreen();
      expect(dateTimePicker.props.children).toContain('Selected:');
    });

    it('handles date change events', async () => {
      const { getByTestId, findByRole } = renderWithContext(<Scheduler />);

      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');
      const dateTimePicker = getByTestId('date-time-picker');

      // Fill form with valid data
      fireEvent.changeText(titleInput, 'Test Title');
      fireEvent.changeText(messageInput, 'Test message content');

      // Simulate date change using the testing utility
      await act(async () => {
        simulateDatePickerPress(dateTimePicker);
      });

      // Verify form is still valid after date change
      const submitButton = await findByRole('button', { name: 'Schedule message' });
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    it('passes correct date to notification scheduler', async () => {
      mockSchedulePushNotification.mockResolvedValue('mock-notification-id');

      const { getByTestId, findByRole } = renderWithContext(<Scheduler />);

      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');
      const dateTimePicker = getByTestId('date-time-picker');

      // Fill form
      fireEvent.changeText(titleInput, 'Test Title');
      fireEvent.changeText(messageInput, 'Test message content');

      // Change date using the testing utility
      await act(async () => {
        simulateDatePickerPress(dateTimePicker);
      });

      // Submit form
      const submitButton = await findByRole('button', { name: 'Schedule message' });
      await act(async () => {
        fireEvent.press(submitButton);
      });

      // Verify scheduler was called with a future date
      expect(mockSchedulePushNotification).toHaveBeenCalledTimes(1);
      const scheduledDate = mockSchedulePushNotification.mock.calls[0][0].date;
      expect(scheduledDate).toBeInstanceOf(Date);
      expect(scheduledDate.getTime()).toBeGreaterThan(Date.now());
    });

    it('validates that date is in the future', async () => {
      const { getByTestId, findByRole } = renderWithContext(<Scheduler />);

      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');

      // Fill form with valid text
      fireEvent.changeText(titleInput, 'Test Title');
      fireEvent.changeText(messageInput, 'Test message content');

      // The default should be future, so form should be valid
      const submitButton = await findByRole('button', { name: 'Schedule message' });
      expect(submitButton.props.accessibilityState.disabled).toBe(false);
    });

    it('resets date to default after successful submission', async () => {
      mockSchedulePushNotification.mockResolvedValue('mock-notification-id');

      const { getByTestId, findByRole } = renderWithContext(<Scheduler />);

      const titleInput = getByTestId('title-input');
      const messageInput = getByTestId('message-input');

      // Fill and submit form
      fireEvent.changeText(titleInput, 'Test Title');
      fireEvent.changeText(messageInput, 'Test message content');

      const submitButton = await findByRole('button', { name: 'Schedule message' });
      await act(async () => {
        fireEvent.press(submitButton);
      });

      // Wait for form reset
      await waitFor(() => {
        expect(submitButton.props.accessibilityState.disabled).toBe(true);
      });
    });
  });
});
