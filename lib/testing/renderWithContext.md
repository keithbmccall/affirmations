# Render Utilities

The render utilities provide a consistent way to render components with common context providers across all tests.

## Quick Start

```typescript
import { renderWithContext } from '@testing';

// Replace your old render calls
const { getByTestId } = renderWithContext(<YourComponent />);
```

## Configuration Options

```typescript
interface RenderWithContextConfig {
  /** Theme to use - defaults to DarkTheme */
  theme?: typeof DarkTheme | typeof DefaultTheme;
  /** Whether to include GestureHandlerRootView - defaults to true */
  includeGestureHandler?: boolean;
  /** Whether to include StateContextProvider - defaults to true */
  includeStateProvider?: boolean;
  /** Whether to include ThemeProvider - defaults to true */
  includeThemeProvider?: boolean;
  /** Additional wrapper component */
  wrapper?: React.ComponentType<{ children: React.ReactNode }>;
}
```

## Examples

### Basic Usage (Full Context)

```typescript
import { renderWithContext } from '@testing';

// Uses all default providers (GestureHandler + StateContext + DarkTheme)
const { getByTestId } = renderWithContext(<MyComponent />);
```

### Custom Configuration

```typescript
import { renderWithContext } from '@testing';
import { DefaultTheme } from '@react-navigation/native';

// Light theme with custom config
const { getByTestId } = renderWithContext(
  <MyComponent />,
  { theme: DefaultTheme }
);

// Without gesture handler
const { getByTestId } = renderWithContext(
  <MyComponent />,
  { includeGestureHandler: false }
);

// Minimal setup (no providers)
const { getByTestId } = renderWithContext(
  <MyComponent />,
  {
    includeGestureHandler: false,
    includeStateProvider: false,
    includeThemeProvider: false,
  }
);
```

### Custom Wrapper

```typescript
import { renderWithContext } from '@testing';

const CustomWrapper = ({ children }) => (
  <SomeProvider>
    {children}
  </SomeProvider>
);

const { getByTestId } = renderWithContext(
  <MyComponent />,
  { wrapper: CustomWrapper }
);
```

### Additional Render Options

```typescript
import { renderWithContext } from '@testing';

// Pass additional options to @testing-library/react-native render
const { getByTestId } = renderWithContext(
  <MyComponent />,
  { theme: DefaultTheme },
  { createNodeMock: () => ({ focus: jest.fn() }) }
);
```

## Migration Guide

### Before (Old Way)

```typescript
// Duplicated across test files
const renderWithContext = (component: React.ReactNode) => {
  return render(
    <GestureHandlerRootView>
      <StateContextProvider>
        <ThemeProvider value={DarkTheme}>
          {component}
        </ThemeProvider>
      </StateContextProvider>
    </GestureHandlerRootView>
  );
};
```

### After (New Way)

```typescript
// Shared utility
import { renderWithContext } from '@testing';

const { getByTestId } = renderWithContext(<MyComponent />);
```

## Provider Details

### GestureHandlerRootView

- **Purpose**: Required for components using react-native-gesture-handler
- **Default**: Included (`includeGestureHandler: true`)
- **Disable when**: Testing pure UI components without gestures

### StateContextProvider

- **Purpose**: Provides app-wide state management context
- **Default**: Included (`includeStateProvider: true`)
- **Disable when**: Testing components that don't need app state

### ThemeProvider

- **Purpose**: Provides theme context for styled components
- **Default**: DarkTheme (`includeThemeProvider: true`)
- **Options**: DarkTheme, DefaultTheme (light)
- **Disable when**: Testing unstyled components

## Complete Examples

### Basic Component Test

```typescript
import { renderWithContext } from '@testing';
import { fireEvent } from '@testing-library/react-native';

describe('MyComponent', () => {
  it('handles user interactions', () => {
    const { getByTestId } = renderWithContext(<MyComponent />);

    const button = getByTestId('my-button');
    fireEvent.press(button);

    // Test assertions...
  });
});
```

### Light Theme Test

```typescript
import { renderWithContext } from '@testing';
import { DefaultTheme } from '@react-navigation/native';

describe('MyComponent', () => {
  it('works with light theme', () => {
    const { getByTestId } = renderWithContext(
      <MyComponent />,
      { theme: DefaultTheme }
    );

    // Test light theme specific behavior...
  });
});
```

### Pure UI Component Test

```typescript
import { renderPresets } from '@testing';

describe('PureUIComponent', () => {
  it('renders without context providers', () => {
    // Component doesn't need app state or themes
    const { getByTestId } = renderPresets.minimal(<PureUIComponent />);

    // Test pure UI behavior...
  });
});
```

### Custom Provider Test

```typescript
import { renderWithContext } from '@testing';

const TestProvider = ({ children }) => (
  <MyCustomProvider value="test">
    {children}
  </MyCustomProvider>
);

describe('ComponentWithCustomProvider', () => {
  it('works with custom provider', () => {
    const { getByTestId } = renderWithContext(
      <ComponentWithCustomProvider />,
      { wrapper: TestProvider }
    );

    // Test with custom provider...
  });
});
```

## Best Practices

1. **Use `renderWithContext`** for consistent context provider setup
2. **Use `renderPresets`** for common scenarios
3. **Choose the right preset** based on your component's needs:
   - `full` - Components needing all providers
   - `light`/`dark` - Theme-specific tests
   - `noGestures` - Components without gesture handling
   - `noState` - Pure UI components
   - `minimal` - Components with no context dependencies
4. **Test behavior, not implementation** - focus on what the user experiences
5. **Use consistent patterns** across your test suite

## When to Use Each Preset

| Preset       | Use When                                |
| ------------ | --------------------------------------- |
| `full`       | Components need all providers (default) |
| `light`      | Testing light theme specific behavior   |
| `dark`       | Testing dark theme specific behavior    |
| `noGestures` | Components don't use gesture handling   |
| `noState`    | Pure UI components without app state    |
| `minimal`    | Components with no context dependencies |

## TypeScript Support

All utilities are fully typed with TypeScript. Import types as needed:

```typescript
import type { RenderWithContextConfig } from '@testing';
```

## Troubleshooting

### Common Issues

**Issue**: Component throws error about missing provider
**Solution**: Make sure you're including the required provider in your config

**Issue**: Gesture handlers not working in tests
**Solution**: Ensure `includeGestureHandler: true` (default) or use `renderPresets.full`

**Issue**: Theme styles not applying
**Solution**: Check if you're using the correct theme (`DarkTheme` vs `DefaultTheme`)

### Performance Tips

- Use `renderPresets.minimal` for components that don't need context providers
- Use `renderPresets.noState` for pure UI components to avoid unnecessary state setup
- Use `renderPresets.noGestures` for components without gesture handling
