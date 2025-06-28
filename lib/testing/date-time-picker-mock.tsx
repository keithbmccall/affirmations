import React from 'react';
import { View } from 'react-native';

// Types for the mock configuration
export interface DateTimePickerMockConfig {
  /** Custom onChange behavior - if not provided, uses default future date simulation */
  onChange?: (event: any, date?: Date) => void;
  /** Custom testID - defaults to 'date-time-picker' */
  testID?: string;
  /** Custom date value to display */
  value?: Date;
  /** Custom display format function */
  formatDate?: (date?: Date) => string;
  /** Additional props to pass to the mock View */
  additionalProps?: Record<string, any>;
}

// Default date formatter
const defaultFormatDate = (date?: Date) => `Selected: ${date?.toLocaleString() || 'No date'}`;

// Default onChange behavior - simulates selecting a future date
const defaultOnChange = (originalOnChange?: any) => () => {
  const newDate = new Date(Date.now() + 60000); // 1 minute from now
  originalOnChange?.(undefined, newDate);
};

/**
 * Creates a configurable DateTimePicker mock implementation
 */
export const createDateTimePickerMock = (config: DateTimePickerMockConfig = {}) => {
  const {
    onChange: customOnChange,
    testID = 'date-time-picker',
    formatDate = defaultFormatDate,
    additionalProps = {},
  } = config;

  return ({ onChange, value, testID: propsTestID, ...otherProps }: any) => {
    const finalTestID = propsTestID || testID;
    const onPressHandler = customOnChange || defaultOnChange(onChange);

    return (
      <View
        testID={finalTestID}
        accessibilityLabel="Date and time picker"
        onPress={onPressHandler}
        {...additionalProps}
        {...otherProps}
      >
        {formatDate(value)}
      </View>
    );
  };
};

/**
 * Sets up the DateTimePicker mock with jest.mock()
 * Call this at the top of your test file after imports
 */
export const setupDateTimePickerMock = (config?: DateTimePickerMockConfig) => {
  // This should be called after the jest.mock() declaration
  const DateTimePicker = require('@react-native-community/datetimepicker').default;
  const MockedDateTimePicker = DateTimePicker as jest.MockedFunction<typeof DateTimePicker>;

  MockedDateTimePicker.mockImplementation(createDateTimePickerMock(config));

  return MockedDateTimePicker;
};

/**
 * Helper function to simulate date picker interactions
 */
export const simulateDatePickerChange = (onChange: any, newDate: Date) => {
  if (onChange) {
    onChange(undefined, newDate);
  }
};

/**
 * Helper to simulate pressing the date picker (for default mock behavior)
 */
export const simulateDatePickerPress = (dateTimePickerElement: any) => {
  if (dateTimePickerElement?.props?.onPress) {
    dateTimePickerElement.props.onPress();
  }
};

/**
 * Common date utilities for testing
 */
export const testDateUtils = {
  /** Get a date 1 minute in the future */
  futureDate: () => new Date(Date.now() + 60000),

  /** Get a date 1 minute in the past */
  pastDate: () => new Date(Date.now() - 60000),

  /** Get a date N minutes from now */
  dateFromNow: (minutes: number) => new Date(Date.now() + minutes * 60000),

  /** Fixed timestamp for consistent testing */
  fixedDate: () => new Date('2024-01-01T12:00:00.000Z'),
};
