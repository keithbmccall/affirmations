# DateTimePicker Mock Utility

The DateTimePicker mock provides a configurable way to mock `@react-native-community/datetimepicker` in your tests.

## Quick Start

```typescript
// In your test file
jest.mock('@react-native-community/datetimepicker');
import { setupDateTimePickerMock, simulateDatePickerPress } from '@testing';

// Set up the mock with default configuration
setupDateTimePickerMock();

// Use in your tests
const { getByTestId } = render(<YourComponent />);
const dateTimePicker = getByTestId('date-time-picker');
simulateDatePickerPress(dateTimePicker);
```

## Configuration Options

The `setupDateTimePickerMock` function accepts a configuration object:

```typescript
interface DateTimePickerMockConfig {
  /** Custom onChange behavior */
  onChange?: (event: any, date?: Date) => void;
  /** Custom testID - defaults to 'date-time-picker' */
  testID?: string;
  /** Custom date formatting function */
  formatDate?: (date?: Date) => string;
  /** Additional props to pass to the mock View */
  additionalProps?: Record<string, any>;
}
```

## Examples

### Basic Usage

```typescript
// Default configuration - simulates selecting a future date
setupDateTimePickerMock();
```

### Custom TestID

```typescript
setupDateTimePickerMock({
  testID: 'my-custom-date-picker',
});
```

### Custom Date Formatting

```typescript
setupDateTimePickerMock({
  formatDate: date => (date ? `📅 ${date.toLocaleDateString()}` : '❌ No date selected'),
});
```

### Custom onChange Behavior

```typescript
setupDateTimePickerMock({
  onChange: (event, date) => {
    // Custom behavior - always select a fixed date
    const fixedDate = new Date('2024-01-01T12:00:00.000Z');
    originalOnChange?.(event, fixedDate);
  },
});
```

### Additional Props

```typescript
setupDateTimePickerMock({
  additionalProps: {
    style: { backgroundColor: 'red' },
    disabled: false,
  },
});
```

## Helper Functions

### `simulateDatePickerPress(element)`

Simulates pressing the DateTimePicker element (triggers onPress).

```typescript
const dateTimePicker = getByTestId('date-time-picker');
simulateDatePickerPress(dateTimePicker);
```

**What it does:**

- Simulates a **user tapping/pressing** the DateTimePicker element
- Calls the `onPress` handler on the mock DateTimePicker
- Uses the mock's internal logic to determine what date to select (default: 1 minute from now)

### `simulateDatePickerChange(onChange, newDate)`

Directly calls the onChange function with a new date.

```typescript
const mockOnChange = jest.fn();
simulateDatePickerChange(mockOnChange, new Date());
```

**What it does:**

- **Directly calls** the `onChange` callback with a specific date
- Bypasses all UI interaction - no pressing, no mock logic
- You control exactly what date gets passed

### When to Use Each

**Use `simulateDatePickerPress` when:**

- Testing user interaction flows
- You want realistic behavior (using mock's default logic)
- Integration-style testing

**Use `simulateDatePickerChange` when:**

- You need to test with specific dates
- Testing edge cases (past dates, far future dates)
- Unit testing onChange handlers directly

## Date Utilities

The `testDateUtils` object provides common date utilities for testing:

```typescript
import { testDateUtils } from '@testing';

// Get a date 1 minute in the future
const futureDate = testDateUtils.futureDate();

// Get a date 1 minute in the past
const pastDate = testDateUtils.pastDate();

// Get a date N minutes from now
const dateIn5Minutes = testDateUtils.dateFromNow(5);

// Get a fixed date for consistent testing
const fixedDate = testDateUtils.fixedDate(); // 2024-01-01T12:00:00.000Z
```

## Advanced Usage

### Multiple Mock Configurations

```typescript
// For error testing
const errorMock = createDateTimePickerMock({
  onChange: () => {
    throw new Error('Date selection failed');
  },
});

// For past date testing
const pastDateMock = createDateTimePickerMock({
  onChange: originalOnChange => () => {
    const pastDate = testDateUtils.pastDate();
    originalOnChange?.(undefined, pastDate);
  },
});
```

### Complete Example

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { setupDateTimePickerMock, simulateDatePickerPress } from '@testing';

jest.mock('@react-native-community/datetimepicker');

describe('MyComponent', () => {
  beforeEach(() => {
    setupDateTimePickerMock({
      testID: 'my-date-picker',
      formatDate: (date) => `Selected: ${date?.toLocaleDateString() || 'None'}`,
    });
  });

  it('handles date selection', () => {
    const { getByTestId } = render(<MyComponent />);

    const dateTimePicker = getByTestId('my-date-picker');
    simulateDatePickerPress(dateTimePicker);

    // Verify the component behavior after date selection
    expect(dateTimePicker.props.children).toContain('Selected:');
  });
});
```

## Why Mock DateTimePicker?

Native components like DateTimePicker require mocking because:

1. **Native Dependencies**: They depend on native iOS/Android modules not available in Jest
2. **Props Exposure**: Native components don't expose props the same way in test environments
3. **Event Complexity**: Real components expect complex event structures that are hard to simulate
4. **Consistency**: Mocks provide predictable, controllable behavior for testing

## Best Practices

1. **Use the shared utility** instead of creating custom mocks in each test file
2. **Configure once** at the test file level using `setupDateTimePickerMock()`
3. **Use semantic helpers** like `simulateDatePickerPress()` for better test readability
4. **Test behavior, not implementation** - focus on what the user experiences
5. **Use `testDateUtils`** for consistent date handling across tests

## TypeScript Support

All utilities are fully typed with TypeScript. Import types as needed:

```typescript
import type { DateTimePickerMockConfig } from '@testing';
```
