import { StateContextProvider } from '@platform';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { render, RenderOptions } from '@testing-library/react-native';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Configuration options for the render context
export interface RenderWithContextConfig {
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

/**
 * Renders a component with common context providers for testing
 *
 * @param component - The React component to render
 * @param config - Configuration options for context providers
 * @param renderOptions - Additional options to pass to @testing-library/react-native render
 * @returns The rendered component with testing utilities
 */
export const renderWithContext = (
  component: React.ReactElement,
  config: RenderWithContextConfig = {},
  renderOptions?: RenderOptions
) => {
  const {
    theme = DarkTheme,
    includeGestureHandler = true,
    includeStateProvider = true,
    includeThemeProvider = true,
    wrapper: AdditionalWrapper,
  } = config;

  // Build the wrapper component with the requested providers
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    let wrappedChildren = children;

    // Add ThemeProvider if requested
    if (includeThemeProvider) {
      wrappedChildren = <ThemeProvider value={theme}>{wrappedChildren}</ThemeProvider>;
    }

    // Add StateContextProvider if requested
    if (includeStateProvider) {
      wrappedChildren = <StateContextProvider>{wrappedChildren}</StateContextProvider>;
    }

    // Add GestureHandlerRootView if requested
    if (includeGestureHandler) {
      wrappedChildren = <GestureHandlerRootView>{wrappedChildren}</GestureHandlerRootView>;
    }

    // Add additional wrapper if provided
    if (AdditionalWrapper) {
      wrappedChildren = <AdditionalWrapper>{wrappedChildren}</AdditionalWrapper>;
    }

    return <>{wrappedChildren}</>;
  };

  return render(component, {
    wrapper: TestWrapper,
    ...renderOptions,
  });
};

/**
 * Preset configurations for common testing scenarios
 */
export const renderPresets = {
  /** Full context with all providers (default) */
  full: (component: React.ReactElement, renderOptions?: RenderOptions) =>
    renderWithContext(component, {}, renderOptions),

  /** Light theme variant */
  light: (component: React.ReactElement, renderOptions?: RenderOptions) =>
    renderWithContext(component, { theme: DefaultTheme }, renderOptions),

  /** Dark theme variant */
  dark: (component: React.ReactElement, renderOptions?: RenderOptions) =>
    renderWithContext(component, { theme: DarkTheme }, renderOptions),

  /** Without gesture handler (for components that don't need it) */
  noGestures: (component: React.ReactElement, renderOptions?: RenderOptions) =>
    renderWithContext(component, { includeGestureHandler: false }, renderOptions),

  /** Without state provider (for pure UI components) */
  noState: (component: React.ReactElement, renderOptions?: RenderOptions) =>
    renderWithContext(component, { includeStateProvider: false }, renderOptions),

  /** Minimal context (no providers) */
  minimal: (component: React.ReactElement, renderOptions?: RenderOptions) =>
    renderWithContext(
      component,
      {
        includeGestureHandler: false,
        includeStateProvider: false,
        includeThemeProvider: false,
      },
      renderOptions
    ),
};
