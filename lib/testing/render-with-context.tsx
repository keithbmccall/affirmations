import StateContextProvider from '@platform/state-context-provider';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  MockContextConfig,
  render,
  RenderOptions,
  renderRouter,
} from 'expo-router/testing-library';
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

const createTestWrapper = (config: RenderWithContextConfig) => {
  const {
    theme = DarkTheme,
    includeGestureHandler = true,
    includeStateProvider = true,
    includeThemeProvider = true,
    wrapper: AdditionalWrapper,
  } = config;

  return ({ children }: { children: React.ReactNode }) => {
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
};

/**
 * Renders a component with common context providers for testing
 *
 * @param component - The React component to render
 * @param config - Configuration options for context providers
 * @param renderOptions - Additional options to pass to the render function
 * @returns The rendered component with testing utilities
 */
export const renderWithContext = (
  component: React.ReactElement,
  config: RenderWithContextConfig = {},
  renderOptions?: RenderOptions
) => {
  return render(component, {
    wrapper: createTestWrapper(config),
    ...renderOptions,
  });
};

export const renderRouterWithContext = (
  context: MockContextConfig,
  config: RenderWithContextConfig = {},
  renderOptions?: RenderOptions
) => {
  return renderRouter(context, {
    wrapper: createTestWrapper(config),
    ...renderOptions,
  });
};
