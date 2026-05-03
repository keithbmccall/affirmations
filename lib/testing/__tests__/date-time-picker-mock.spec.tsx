import {
  createDateTimePickerMock,
  simulateDatePickerChange,
  simulateDatePickerPress,
  testDateUtils,
} from '@testing/date-time-picker-mock';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

describe('date-time-picker-mock', () => {
  it('formats missing dates with the default formatter', () => {
    const MockPicker = createDateTimePickerMock();
    const { getByTestId } = render(<MockPicker value={undefined} onChange={jest.fn()} />);
    expect(getByTestId('date-time-picker').props.children).toContain('No date');
  });

  it('creates a mock that honors custom handlers and formatters', () => {
    const customChange = jest.fn();
    const MockPicker = createDateTimePickerMock({
      onChange: customChange,
      formatDate: () => 'formatted',
      testID: 'custom-picker',
    });
    const { getByTestId } = render(
      <MockPicker value={new Date('2024-06-01T12:00:00.000Z')} onChange={jest.fn()} />
    );
    fireEvent.press(getByTestId('custom-picker'));
    expect(customChange).toHaveBeenCalled();
    expect(getByTestId('custom-picker').props.children).toBe('formatted');
  });

  it('covers picker simulation helpers and date utilities', () => {
    simulateDatePickerChange(undefined, new Date());
    simulateDatePickerChange(jest.fn(), new Date());
    simulateDatePickerPress({});
    simulateDatePickerPress({ props: {} });
    simulateDatePickerPress({ props: { onPress: () => {} } } as never);

    expect(testDateUtils.futureDate().getTime()).toBeGreaterThan(Date.now());
    expect(testDateUtils.pastDate().getTime()).toBeLessThan(Date.now());
    expect(testDateUtils.dateFromNow(2).getTime()).toBeGreaterThan(Date.now());
    expect(testDateUtils.fixedDate().toISOString()).toContain('2024');
  });
});
