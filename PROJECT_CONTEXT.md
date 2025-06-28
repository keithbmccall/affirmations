# Project Context & Instructions

## Project Overview

This is a React Native/Expo affirmations app built with TypeScript. The app allows users to schedule and manage affirmations with notifications.

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + useReducer
- **Testing**: Jest + React Native Testing Library
- **Styling**: Custom theme system with dark/light mode support
- **Notifications**: Expo Notifications
- **Storage**: AsyncStorage
- **Build System**: EAS Build

## Project Structure

### Core Directories

```
├── app/                    # Expo Router pages (file-based routing)
│   ├── (modals)/          # Modal routes
│   ├── (tabs)/            # Tab-based navigation
│   └── _layout.tsx        # Root layout
├── lib/                   # Main application code
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature-specific logic
│   ├── platform/          # State management (actions, reducers)
│   ├── screen-containers/ # Screen-level containers
│   ├── storage/           # Data persistence
│   ├── styles/            # Theme and styling
│   ├── testing/           # Testing utilities
│   └── utils/             # Utility functions
├── android/               # Android-specific files
├── ios/                   # iOS-specific files
└── assets/                # Static assets
```

### Key Components Architecture

- **StateContextProvider**: Global state management using React Context
- **ScheduleHistory**: Main notification management component
- **NotificationDetailsModal**: Modal for viewing notification details
- **Themed Components**: UI components with built-in theme support

## Coding Style & Conventions

### 📁 **Import Organization**

```typescript
// 1. Custom components (absolute imports)
import { ThemedButton, ThemedText, ThemedView } from '@components/shared';

// 2. Features and platform (absolute imports)
import { useNotificationsScheduler } from '@features/notifications';
import { useAffirmations } from '@platform';

// 3. External libraries
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';

// 4. React and React Native
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
```

### 🏗️ **Component Structure**

```typescript
// Props interface first (when needed)
interface ComponentProps {
  initialDate?: Date;
  initialTitle?: string;
  enableRefreshControl?: boolean;
  submitProps?: {
    submitText: string;
    onSubmit: (values: FormValues) => void;
  };
}

// Component with default parameters
export const MyComponent = ({
  initialDate = fiveMinutesFromNow,
  initialTitle = '',
  enableRefreshControl = true,
  submitProps,
}: ComponentProps) => {
  // Hook declarations first
  const [state, setState] = useState<StateType>(initialState);
  const customHook = useCustomHook();

  // Derived state with useMemo/useCallback
  const derivedValue = useMemo(() => {
    return computeValue(state);
  }, [state]);

  // Event handlers
  const handleEvent = useCallback(() => {
    // Handler logic
  }, [dependencies]);

  // Render
  return (
    <ThemedView>
      {/* Component JSX */}
    </ThemedView>
  );
};
```

### 🎨 **Styling System & Patterns**

#### **Style Helpers & Utilities**

The app uses a comprehensive styling system with multiple helper utilities:

**Main Exports (`lib/styles/index.ts`):**

- `colors` - Comprehensive color palette
- `globalStyles` - Common style patterns
- `spacing` - Consistent spacing system
- `useColorScheme` - Color scheme detection
- `useThemeColor` - Theme-aware color selection

#### **Color System (`colors.ts`)**

```typescript
// Comprehensive color palette with semantic naming
colors.primary[500]; // Primary blue
colors.secondary[300]; // Light gray
colors.accent.green; // Success green
colors.semantic.error; // Error red
colors.text.primary; // Primary text color
colors.ui.background; // Background color
colors.material.blue; // Material Design blue
colors.human.forestGreen; // Human-readable color names
```

**Color Categories:**

- **Primary/Secondary**: Blue and gray palettes (50-900)
- **Accent**: Named colors (blue, green, yellow, red, purple, pink, orange, teal)
- **Semantic**: success, warning, error, info
- **UI**: background, surface, border, divider, shadow, overlay
- **Text**: primary, secondary, tertiary, inverse, disabled
- **Material**: Full Material Design palette
- **Human**: Human-readable color names (forestGreen, crimson, etc.)
- **Brand**: Common brand colors (apple, google, microsoft, etc.)

#### **Spacing System (`spacing.ts`)**

```typescript
// 4px base unit system
spacing.xs; // 4px
spacing.sm; // 8px
spacing.md; // 12px
spacing.lg; // 16px
spacing.xl; // 20px
spacing['2xl']; // 24px
spacing['3xl']; // 32px
spacing['4xl']; // 40px
// ... up to 10xl (112px)

// Semantic spacing
spacing.screenPadding; // 16px
spacing.sectionSpacing; // 24px
spacing.componentSpacing; // 12px
spacing.itemSpacing; // 8px

// Border radius
spacing.borderRadius.sm; // 4px
spacing.borderRadius.md; // 8px
spacing.borderRadius.lg; // 12px
spacing.borderRadius.xl; // 16px
spacing.borderRadius.full; // 9999px
```

#### **Global Styles (`globalStyles.ts`)**

```typescript
// Flex layouts
globalStyles.flexColumn; // flexDirection: 'column'
globalStyles.flexRow; // flexDirection: 'row'
globalStyles.flex1; // flex: 1
globalStyles.flexGrow; // flexGrow: 1

// Centering
globalStyles.center; // justifyContent + alignItems center
globalStyles.justifyCenter; // justifyContent: 'center'
globalStyles.alignCenter; // alignItems: 'center'

// Alignment
globalStyles.justifyBetween; // justifyContent: 'space-between'
globalStyles.justifyAround; // justifyContent: 'space-around'
globalStyles.alignStart; // alignItems: 'flex-start'
globalStyles.alignEnd; // alignItems: 'flex-end'

// Common layouts
globalStyles.rowCenter; // row + alignItems center
globalStyles.rowBetween; // row + space-between + center
globalStyles.columnCenter; // column + alignItems center

// Position
globalStyles.absolute; // position: 'absolute'
globalStyles.absoluteFill; // absolute + top/left/right/bottom: 0

// Component bases
globalStyles.buttonBase; // Common button layout
globalStyles.cardBase; // Common card layout
globalStyles.inputBase; // Common input layout
globalStyles.headerBase; // Common header layout
```

#### **Theme Hooks**

```typescript
// Color scheme detection (handles web hydration)
const colorScheme = useColorScheme(); // 'light' | 'dark'

// Theme-aware color selection
const backgroundColor = useThemeColor(
  { light: colors.ui.background, dark: colors.gray[900] },
  'background'
);
```

#### **Styling Patterns**

```typescript
// StyleSheet at component bottom
const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,        // Spread global styles first
    padding: spacing.screenPadding, // Use spacing constants
  },
  button: {
    backgroundColor: colors.primary[500], // Use color system
    borderRadius: spacing.borderRadius.xl,
    ...globalStyles.alignCenter,         // Compose with global styles
  },
  conditionalStyle: {
    borderWidth: 1,
    borderColor: colors.primary[500],
    // Conditional styles applied in component
  },
});

// Usage in component with conditional styling
<ThemedButton
  style={[
    styles.button,
    isActive && { backgroundColor: colors.primary[500] }
  ]}
>
```

**Style Composition Best Practices:**

1. **Spread global styles first** in StyleSheet definitions
2. **Use spacing constants** instead of magic numbers
3. **Apply color system** for consistency
4. **Compose styles** with arrays for conditional styling
5. **Theme-aware styling** with useThemeColor hook

### 🔧 **State Management Patterns**

#### **1. Form State with Validation**

```typescript
// Custom interface for form fields
interface FormField<T> {
  value: T;
  error: string;
}

// State setup
const [title, setTitle] = useState<FormField<string>>({
  value: initialTitle,
  error: '',
});

// Handlers with error clearing
const handleTitleChange = (text: string) => {
  setTitle({ value: text, error: '' });
};

// Validation function
const validateForm = () => {
  let isValid = true;
  const titleValue = title.value.trim();

  if (!titleValue) {
    setTitle({ ...title, error: 'Title is required' });
    isValid = false;
  }

  return isValid;
};
```

#### **2. Derived State with Performance**

```typescript
// Use useMemo for expensive computations
const notificationsByDate = useMemo(() => {
  const notifications = isPendingPage ? pendingNotifications : historyNotifications;
  return notifications.slice().sort((a, b) => {
    return a.content.data.triggerDate.time - b.content.data.triggerDate.time;
  });
}, [pendingNotifications, historyNotifications, page]);

// Use useCallback for event handlers
const onRefresh = useCallback(async () => {
  setRefreshing(true);
  await refreshPendingNotifications();
  setTimeout(() => setRefreshing(false), 500);
}, [refreshPendingNotifications]);
```

### 🎯 **Component Design Patterns**

#### **1. 🚫 NEVER Define Components Inside Other Components**

**CRITICAL RULE: Never define a component inside another component. This creates performance issues and violates React best practices.**

**❌ BAD - Defining components inside other components:**

```typescript
// DON'T: Component defined inside another component
export const MyComponent = () => {
  // This creates a new component on every render - performance issue!
  const InnerComponent = ({ data }) => (
    <View>
      <Text>{data.title}</Text>
    </View>
  );

  return (
    <ScrollView>
      {items.map(item => (
        <InnerComponent key={item.id} data={item} />
      ))}
    </ScrollView>
  );
};
```

**Why this is bad:**

- **Performance**: Creates a new component function on every render
- **Memory**: Prevents React from optimizing re-renders
- **Debugging**: Makes component tree harder to debug
- **Testing**: Complicates unit testing and mocking

**✅ GOOD - Extract components to separate definitions:**

```typescript
// Define components outside of other components
interface ItemRowProps {
  data: ItemData;
}

const ItemRow = ({ data }: ItemRowProps) => (
  <View>
    <Text>{data.title}</Text>
  </View>
);

export const MyComponent = () => {
  return (
    <ScrollView>
      {items.map(item => (
        <ItemRow key={item.id} data={item} />
      ))}
    </ScrollView>
  );
};
```

**Why this is good:**

- **Performance**: Component is defined once and reused
- **Optimization**: React can properly optimize re-renders
- **Maintainability**: Easier to read, test, and debug
- **Reusability**: Component can be easily extracted to separate file

**Options for extraction:**

- **Same file**: Define above the parent component (for closely related components)
- **Separate file**: Create dedicated component file (preferred for reusability)
- **Render functions**: Only for very simple JSX (not recommended for complex components)

**Enforcement:**

- **Always** define components outside of other components
- **Always** use proper TypeScript interfaces for props
- **Prefer** separate files for reusable components
- **Never** use the "Component-in-Component" anti-pattern
- **Never** define components inside render functions or other components

**Common Anti-Pattern Examples to Avoid:**

```typescript
// ❌ DON'T: Component defined inside render function
export const MyComponent = () => {
  const renderItem = ({ item }) => {
    const ItemComponent = () => <Text>{item.title}</Text>; // BAD!
    return <ItemComponent />;
  };

  return <FlatList renderItem={renderItem} />;
};

// ❌ DON'T: Component defined inside another component
export const ParentComponent = () => {
  const ChildComponent = () => <View><Text>Child</Text></View>; // BAD!

  return <ChildComponent />;
};

// ❌ DON'T: Component defined inside useEffect or other hooks
export const MyComponent = () => {
  useEffect(() => {
    const DynamicComponent = () => <Text>Dynamic</Text>; // BAD!
    // ...
  }, []);
};
```

#### **2. Flexible Props with Defaults**

```typescript
// Optional configuration with sensible defaults
interface SchedulerProps {
  initialDate?: Date;
  bodyLines?: number;
  enableRefreshControl?: boolean;
  submitProps?: {
    submitText: string;
    onSubmit: (values: FormValues) => void;
  };
}

// Default values in destructuring
export const Scheduler = ({
  initialDate = fiveMinutesFromNow,
  bodyLines = 4,
  enableRefreshControl = true,
  submitProps,
}: SchedulerProps) => {
```

#### **3. Conditional Logic Patterns**

```typescript
// Boolean flags for readability
const isPendingPage = page === SCHEDULE_HISTORY_PAGES.PENDING;
const isHistoryPage = page === SCHEDULE_HISTORY_PAGES.HISTORY;
const isFormValid = title.value.trim() !== '' && message.value.trim() !== '';

// Early validation returns
if (!validateForm()) {
  return;
}

// Conditional rendering with ternary
{enableRefreshControl ? (
  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
) : undefined}
```

### 🧪 **Testing-Friendly Code**

```typescript
// Always include testID for key interactive elements
<ThemedInput
  testID="title-input"
  placeholder="Enter message title"
  value={title.value}
  onChangeText={handleTitleChange}
/>

<DateTimePicker
  testID="date-time-picker"
  value={date.value}
  mode="datetime"
  onChange={handleDateChange}
/>

// Accessible components
<ThemedText type="subtitle" accessibilityRole="header">
  Date & Time
</ThemedText>
```

### 🎪 **Event Handling Patterns**

```typescript
// Navigation with object-based routing
const handleNotificationPress = (notification: NotificationWithData) => {
  router.push({
    pathname: '/(modals)/notification-details-modal',
    params: {
      notificationId: notification.identifier,
      page,
    },
  });
};

// Form submission with validation and cleanup
const handleSubmit = async () => {
  if (!validateForm()) return;

  const values = { title: title.value, body: message.value, date: date.value };

  if (submitProps?.onSubmit) {
    submitProps.onSubmit(values);
  } else {
    const notificationId = await schedulePushNotification(values);
    Alert.alert('Success', `Message scheduled: ${notificationId}`);
  }

  // Reset form
  setTitle({ value: '', error: '' });
  setMessage({ value: '', error: '' });
};
```

### 📝 **Naming Conventions**

```typescript
// Component names: PascalCase
export const ScheduleHistory = () => {};

// Props interfaces: ComponentNameProps
interface SchedulerProps {}

// Hook variables: descriptive camelCase
const { schedulePushNotification, refreshPendingNotifications } = useNotificationsScheduler();

// Handler functions: handle + EventName
const handleNotificationPress = () => {};
const handleDateChange = () => {};

// Boolean variables: is/has/can + Description
const isPendingPage = page === SCHEDULE_HISTORY_PAGES.PENDING;
```

### 🔄 **Error Handling & User Feedback**

```typescript
// Form validation with user-friendly messages
if (titleValue.length < 3) {
  setTitle({ ...title, error: 'Title needs to be at least 3 characters' });
  isValid = false;
}

// Alert for user feedback
Alert.alert(
  'Message Scheduled',
  `Your message "${title.value}" has been scheduled for ${date.value.toLocaleString()}`,
  [{ text: 'OK' }]
);

// Error display in UI
{title.error ? (
  <ThemedText style={styles.errorText}>{title.error}</ThemedText>
) : null}
```

### 🎨 **Theming & Accessibility**

```typescript
// Use themed components consistently
<ThemedView>
  <ThemedText type="subtitle">Header Text</ThemedText>
  <ThemedButton onPress={handlePress}>
    <ThemedText type="defaultSemiBold">Button Text</ThemedText>
  </ThemedButton>
</ThemedView>

// Accessibility attributes
<ThemedText type="subtitle" accessibilityRole="header">
  Section Title
</ThemedText>

// Semantic color usage
darkColor={colors.semantic.error as string}
lightColor={colors.semantic.error as string}
```

### 📋 **Code Organization**

```typescript
// TODO comments for future improvements
// TODO: swipe to delete logic

// Destructuring for cleaner code
const {
  notifications: { pendingNotifications, historyNotifications },
} = useAffirmations();

// Multiple destructuring from objects
const { content, identifier } = notification;
const { month, day, time } = getHumanReadableDate(new Date(content.data.triggerDate.time));

// Map with destructuring in callback
{
  notificationsByDate.map(notification => {
    const { content, identifier } = notification;
    // Component rendering
  });
}
```

### 🎯 **Performance Considerations**

```typescript
// Memoization for expensive operations
const notificationsByDate = useMemo(() => {
  // Expensive sorting/filtering
}, [dependencies]);

// Callback memoization for handlers
const onRefresh = useCallback(async () => {
  // Handler logic
}, [dependencies]);

// Conditional hook usage
const bottomTabHeight = useBottomTabBarHeight();
// Used in: paddingBottom: bottomTabHeight * 2
```

## Testing Best Practices

### 🏗️ **Test File Organization**

```typescript
// Test files follow this structure:
describe('ComponentName', () => {
  // Setup and mock data at the top
  const mockData = [...];

  beforeEach(() => {
    // Reset mocks
  });

  describe('Feature Group', () => {
    it('describes specific behavior', async () => {
      // Test implementation
    });
  });
});
```

### 🔍 **Query Patterns**

**PREFERRED: Use `findBy*` for Initial Queries**

```typescript
// ✅ Preferred approach - automatically waits for element
const button = await screen.findByRole('button', { name: 'Submit' });
const input = await screen.findByTestId('title-input');
```

**AVOID: Using `waitFor` for Initial Queries**

```typescript
// ❌ Avoid this pattern
await waitFor(() => {
  expect(screen.getByRole('button', { name: 'Submit' })).toBeOnTheScreen();
});
```

**Use `getBy*` for Elements That Should Already Exist**

```typescript
// ✅ When element is guaranteed to exist after initial query
const button = await screen.findByRole('button', { name: 'Submit' });
const input = screen.getByTestId('title-input'); // Already rendered
```

### 🎭 **Mocking Strategies**

#### **1. Global Mocks (jest.setup.js)**

```javascript
// For app-wide dependencies
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  // ... other methods
}));

// Global router setup
beforeAll(() => {
  const originalPush = router.push.bind(router);
  router.push = to => {
    // Handle object-based navigation
  };
});
```

#### **2. Local Test Mocks**

```typescript
// For test-specific behavior
jest.mock('@utils', () => ({
  ...jest.requireActual('@utils'),
  getHumanReadableDate: jest.fn(date => ({
    month: 'January',
    day: 15,
    time: '2:30 PM',
    year: 2024,
  })),
}));
```

#### **3. Mock Data Setup**

```typescript
// Define mock data at the top of describe blocks
const mockNotifications = [
  {
    identifier: 'test-1',
    content: {
      title: 'Test Notification',
      body: 'Test message',
      data: { triggerDate: { time: Date.now() } },
    },
  },
];

// Use in local mocks
jest.mock('@storage', () => ({
  loadData: jest.fn(() => Promise.resolve(mockNotifications)),
}));
```

### 🖼️ **Rendering Patterns**

#### **1. Basic Component Rendering**

```typescript
import { renderWithContext } from '@testing';

// ✅ Provides all necessary context automatically
const { getByTestId } = renderWithContext(<MyComponent />);
```

#### **2. Router-Based Testing**

```typescript
import { renderRouterWithContext } from '@testing';

// ✅ For testing navigation and modal routes
renderRouterWithContext({
  index: MyComponent,
  '(modals)/my-modal': MyModal,
});
```

#### **3. Custom Configuration**

```typescript
// ✅ When you need specific context setup
renderWithContext(<MyComponent />, {
  theme: DefaultTheme,
  includeStateProvider: false,
});
```

### ⚡ **Async Operations**

#### **1. Waiting for Elements**

```typescript
// ✅ Preferred: Built-in waiting
const button = await screen.findByRole('button', { name: 'Submit' });

// ✅ For checking existence after state changes
expect(await screen.findByText('Success message')).toBeOnTheScreen();
```

#### **2. User Interactions**

```typescript
// ✅ For complex interactions that trigger navigation
const button = await screen.findByRole('button', { name: 'Navigate' });
await act(async () => {
  fireEvent.press(button);
});
```

#### **3. State Updates**

```typescript
// ✅ Wait for state changes to complete
fireEvent.changeText(input, 'new value');
const submitButton = await screen.findByRole('button', { name: 'Submit' });
expect(submitButton.props.accessibilityState.disabled).toBe(false);
```

### 🧪 **Testing Utilities**

#### **1. Custom Mock Utilities**

```typescript
// ✅ Use shared utilities for complex mocks
import { setupDateTimePickerMock, simulateDatePickerPress } from '@testing';

jest.mock('@react-native-community/datetimepicker');
const MockedDateTimePicker = setupDateTimePickerMock();
```

#### **2. Helper Functions**

```typescript
// ✅ Use within() for scoped queries
const messageCard = await screen.findByRole('button', { name: 'Message Title' });
expect(within(messageCard).getByText('Message content')).toBeOnTheScreen();
```

### 🎯 **Test Focus Areas**

#### **1. User Behavior Testing**

```typescript
// ✅ Test what users actually do
it('enables submit button when form is valid', async () => {
  renderWithContext(<MyForm />);

  fireEvent.changeText(screen.getByTestId('title-input'), 'Valid Title');
  fireEvent.changeText(screen.getByTestId('message-input'), 'Valid message');

  const submitButton = await screen.findByRole('button', { name: 'Submit' });
  expect(submitButton.props.accessibilityState.disabled).toBe(false);
});
```

#### **2. Error Handling**

```typescript
// ✅ Test error states and validation
it('shows error message for invalid input', async () => {
  renderWithContext(<MyForm />);

  fireEvent.changeText(screen.getByTestId('title-input'), 'Hi');
  fireEvent.press(await screen.findByRole('button', { name: 'Submit' }));

  expect(await screen.findByText('Title needs to be at least 3 characters')).toBeOnTheScreen();
});
```

#### **3. Integration Testing**

```typescript
// ✅ Test component interactions
it('navigates to details when notification is pressed', async () => {
  renderRouterWithContext({
    index: ScheduleHistory,
    '(modals)/notification-details': NotificationDetails,
  });

  const notification = await screen.findByRole('button', { name: 'Morning Affirmation' });
  fireEvent.press(notification);

  expect(await screen.findByRole('header', { name: 'Morning Affirmation' })).toBeOnTheScreen();
});
```

### 🔄 **Cleanup and Reset**

#### **1. Mock Cleanup**

```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    mockFunction.mockClear();
    MockedComponent.mockClear();
  });
});
```

#### **2. Test Isolation**

```typescript
// ✅ Each test should be independent
it('test 1', async () => {
  // Test doesn't depend on previous test state
});

it('test 2', async () => {
  // Fresh start for each test
});
```

### 📝 **Naming Conventions**

#### **1. Test Files**

```
component-name.spec.tsx    # Component tests
feature-name.spec.tsx      # Feature tests
utils.spec.tsx            # Utility tests
```

#### **2. Test Descriptions**

```typescript
// ✅ Descriptive test names
it('enables submit button when form has valid data', async () => {});
it('shows error message when submitting with short title', async () => {});
it('navigates to notification details when notification is pressed', async () => {});
```

### 🚫 **Common Pitfalls to Avoid**

#### **1. Over-mocking**

```typescript
// ❌ Don't mock everything
jest.mock('react', () => ({
  useState: jest.fn(),
  useEffect: jest.fn(),
}));

// ✅ Mock only external dependencies
jest.mock('@storage', () => ({
  loadData: jest.fn(),
}));
```

#### **2. Testing Implementation Details**

```typescript
// ❌ Don't test internal state
expect(component.state.isLoading).toBe(false);

// ✅ Test user-visible behavior
expect(await screen.findByText('Data loaded successfully')).toBeOnTheScreen();
```

#### **3. Synchronous Testing of Async Operations**

```typescript
// ❌ Don't ignore async operations
fireEvent.press(submitButton);
expect(screen.getByText('Success')).toBeOnTheScreen(); // May fail

// ✅ Wait for async operations
fireEvent.press(submitButton);
expect(await screen.findByText('Success')).toBeOnTheScreen();
```

### 🏆 **Best Practices Summary**

1. **Start with `findBy*` queries** for initial element discovery
2. **Use `renderWithContext`** for components needing providers
3. **Mock at the right level** - global for app-wide, local for test-specific
4. **Test user behavior**, not implementation details
5. **Wait for async operations** to complete
6. **Use descriptive test names** that explain the behavior
7. **Keep tests isolated** and independent
8. **Leverage shared utilities** for common patterns
9. **Focus on integration** over unit testing where appropriate
10. **Clean up mocks** between tests

## Testing Conventions

### Test File Structure

- Tests are located in `__tests__` directories within each module
- Test files use `.spec.tsx` naming convention
- Mock files use `.mock.tsx` extension

### Key Testing Utilities

- **renderWithContext**: Renders components with necessary providers
- **renderRouterWithContext**: Renders components with router context
- **setupDateTimePickerMock**: Configurable DateTimePicker mock
- **Global test setup**: `jest.setup.js` contains global mocks and configuration

### Important Test Mocks

```javascript
// Router navigation is handled globally in jest.setup.js
beforeAll(() => {
  const originalPush = router.push.bind(router);
  router.push = to => {
    if (typeof to === 'object') {
      const { pathname, params } = to;
      const search = new URLSearchParams(
        Object.entries(params).reduce((acc, [k, v]) => ({ ...acc, [k]: String(v) }), {})
      ).toString();
      return originalPush(`${pathname}?${search}`);
    }
    return originalPush(to);
  };
});
```

## State Management Pattern

### Actions & Reducers

- Located in `lib/platform/actions/` and `lib/platform/reducers/`
- Actions return functions that dispatch to reducers
- Reducers handle state updates immutably

### Context Usage

```typescript
const { state, actions } = useStateContext();
// state.affirmations.pendingNotifications
// actions.affirmations.onSetPendingNotifications(notifications)
```

## Styling System

### Theme Structure

- Colors: `lib/styles/colors.ts`
- Spacing: `lib/styles/spacing.ts`
- Global styles: `lib/styles/global-styles.ts`
- Hooks: `lib/styles/hooks/`

### Component Styling

- Use themed components (`ThemedView`, `ThemedText`, etc.)
- Support both light and dark modes
- Consistent spacing using the spacing system

## Key Features

### Notifications

- **Scheduling**: Uses Expo Notifications for local notifications
- **History**: Tracks past notifications in AsyncStorage
- **Management**: View, edit, and cancel scheduled notifications

### Navigation

- **File-based routing**: Using Expo Router
- **Modals**: Handled through `(modals)` directory
- **Tabs**: Main navigation through `(tabs)` directory

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.spec.tsx

# Run tests in watch mode
npm test -- --watch
```

### Building

```bash
# Development build
npm run build

# Production build with EAS
eas build --platform android
eas build --platform ios
```

## Important Files

### Configuration

- `app.json`: Expo configuration
- `eas.json`: EAS Build configuration
- `jest.config.js`: Jest testing configuration
- `jest.setup.js`: Global test setup and mocks
- `tsconfig.json`: TypeScript configuration

### Entry Points

- `app/_layout.tsx`: Root layout with providers
- `app/(tabs)/_layout.tsx`: Tab navigation setup
- `lib/platform/state-context-provider.tsx`: Global state provider

## Common Patterns

### Error Handling

- Use try-catch blocks for async operations
- Log errors appropriately
- Provide user-friendly error messages

### Data Flow

1. User interaction triggers action
2. Action dispatches to reducer
3. Reducer updates state
4. Components re-render with new state

### Testing Patterns

- Mock external dependencies (notifications, storage)
- Use async/await for async operations
- Test user interactions, not implementation details
- Ensure proper cleanup after tests

## Troubleshooting

### Common Issues

- **Act warnings**: Usually resolved by waiting for async operations to complete
- **Router navigation**: Use the global router setup in jest.setup.js
- **State updates**: Ensure actions are properly dispatched

### Debug Tools

- Use `debug()` from testing library for component inspection
- Console.log for state inspection (remove before committing)
- React DevTools for component hierarchy

## Notes for AI Assistant

- Always use the established testing patterns
- Prefer existing utility functions over creating new ones
- Follow the project's TypeScript conventions
- Test files should be comprehensive but maintainable
- Use proper error handling and async patterns
- Respect the existing architecture and patterns
- **Always start with `findBy*` queries** for initial element discovery
- **Use `renderWithContext`** for components that need providers
- **Mock at the appropriate level** - global vs local
- **Focus on user behavior** rather than implementation details
