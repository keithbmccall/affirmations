/**
 * Common spacing values for consistent layout throughout the app
 * These values follow a 4px base unit system for consistency
 */
export const spacing = {
  // Micro spacing (0-8px)
  xs: 4,
  sm: 8,

  // Small spacing (12-16px)
  md: 12,
  lg: 16,

  // Medium spacing (20-32px)
  xl: 20,
  '2xl': 24,
  '3xl': 32,

  // Large spacing (40-64px)
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
  '7xl': 64,

  // Extra large spacing (80px+)
  '8xl': 80,
  '9xl': 96,
  '10xl': 112,

  // Common layout spacing
  screenPadding: 16,
  sectionSpacing: 24,
  componentSpacing: 12,
  itemSpacing: 8,

  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // Common gaps
  gap: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
} as const;

export type SpacingKey = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[SpacingKey];
