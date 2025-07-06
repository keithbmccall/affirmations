# Testing Utilities

This directory contains reusable testing utilities that can be shared across the project to ensure consistent and reliable test behavior.

## Available Utilities

### 📅 [DateTimePicker Mock](./date-time-picker-mock.md)

Mock utility for `@react-native-community/datetimepicker` with configurable behavior.

```typescript
import { setupDateTimePickerMock, simulateDatePickerPress } from '@testing';
```

**Features:**

- Configurable date selection behavior
- Helper functions for interaction simulation
- Built-in date utilities for testing
- Full TypeScript support

### 🎨 [Render Utilities](./render-with-context.md)

Consistent rendering with context providers for component testing.

```typescript
import { renderWithContext, renderPresets } from '@testing';
```

**Features:**

- Configurable context provider setup
- Preset configurations for common scenarios
- Theme switching support
- Performance-optimized provider selection

## Quick Start

```typescript
// Basic usage - import what you need
import { renderWithContext, setupDateTimePickerMock } from '@testing';

// Mock native components
jest.mock('@react-native-community/datetimepicker');
setupDateTimePickerMock();

// Render with context
const { getByTestId } = renderWithContext(<YourComponent />);
```

## Library Structure

```
lib/testing/
├── README.md                    # This overview file
├── date-time-picker-mock.md     # DateTimePicker mock docs
├── render-with-context.md       # Render utilities docs
├── index.ts                     # Main exports
├── date-time-picker-mock.tsx    # DateTimePicker mock implementation
└── render-with-context.tsx      # Render utilities implementation
```

## Design Principles

### 🔧 **Configurability**

Every utility accepts configuration options to adapt to different testing scenarios without code duplication.

### 🎯 **Consistency**

All utilities follow the same patterns:

- TypeScript interfaces for configuration
- Helper functions for common operations
- Comprehensive documentation with examples
- Sensible defaults for quick setup

### 📦 **Modularity**

Each utility is self-contained and can be used independently. Import only what you need.

### 🚀 **Performance**

Utilities are designed to minimize test setup overhead and provide only the context needed for each test.

## Best Practices

1. **Import only what you need** - Keep test files lean
2. **Use configuration objects** - Avoid creating multiple similar functions
3. **Follow the naming convention** - Utilities should be descriptive and consistent
4. **Document thoroughly** - Each utility should have comprehensive docs
5. **Test the utilities** - Testing utilities should be tested too

## Adding New Utilities

When adding a new testing utility, follow this pattern:

### 1. Create Implementation File

```typescript
// lib/testing/my-new-utility.tsx
export interface MyUtilityConfig {
  // Configuration options
}

export const setupMyUtility = (config: MyUtilityConfig = {}) => {
  // Implementation
};
```

### 2. Add to Index

```typescript
// lib/testing/index.ts
export { setupMyUtility, type MyUtilityConfig } from './my-new-utility';
```

### 3. Create Documentation

```markdown
<!-- lib/testing/my-new-utility.md -->

# My New Utility

Description of what this utility does...

## Quick Start

...
```

### 4. Update Main README

```markdown
<!-- lib/testing/README.md -->

### 🔧 [My New Utility](./my-new-utility.md)

Brief description of the utility.
```

## TypeScript Support

All utilities are fully typed with TypeScript. Import types as needed:

```typescript
import type { DateTimePickerMockConfig, RenderWithContextConfig } from '@testing';
```

## Testing Philosophy

This library embraces the principle of **testing behavior, not implementation**. Our utilities help you:

- Focus on user interactions rather than internal component state
- Test components in realistic environments with proper context
- Avoid brittle tests that break with refactoring
- Write maintainable tests that serve as living documentation

## Migration Guide

### From Individual Implementations

**Before:**

```typescript
// Duplicated across test files
const renderWithContext = component => {
  /* ... */
};
const MockedDateTimePicker = DateTimePicker as jest.MockedFunction<typeof DateTimePicker>;
```

**After:**

```typescript
// Shared utilities
import { renderWithContext, setupDateTimePickerMock } from '@testing';
```

### Benefits of Migration

- ✅ **Reduced code duplication**
- ✅ **Consistent test behavior**
- ✅ **Easier maintenance**
- ✅ **Better TypeScript support**
- ✅ **Comprehensive documentation**

## Contributing

When contributing to this testing library:

1. Follow the established patterns and conventions
2. Write comprehensive documentation
3. Include examples for common use cases
4. Test your utilities thoroughly
5. Update the main README with your new utility

## Support

For questions or issues with testing utilities:

1. Check the individual utility documentation
2. Review the examples in each doc file
3. Look for similar patterns in existing test files
4. Create an issue if you find bugs or need features

Remember: Good testing utilities make the entire codebase more maintainable! 🚀
