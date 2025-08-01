import { ColorValue as RNColorValue } from 'react-native';
/**
 * Common color palette for consistent theming throughout the app
 * All colors are in hex format for easy use
 */
type Colors = Record<string, Record<string, RNColorValue>>;
export const colors: Colors = {
  // Primary colors
  primary: {
    50: '#eff6ff', // Very light blue
    100: '#dbeafe', // Light blue
    200: '#bfdbfe', // Soft blue
    300: '#93c5fd', // Medium light blue
    400: '#60a5fa', // Medium blue
    500: '#3b82f6', // Blue
    600: '#2563eb', // Medium dark blue
    700: '#1d4ed8', // Dark blue
    800: '#1e40af', // Very dark blue
    900: '#1e3a8a', // Deep blue
  },

  // Secondary colors
  secondary: {
    50: '#f8fafc', // Very light gray
    100: '#f1f5f9', // Light gray
    200: '#e2e8f0', // Soft gray
    300: '#cbd5e1', // Medium light gray
    400: '#94a3b8', // Medium gray
    500: '#64748b', // Gray
    600: '#475569', // Medium dark gray
    700: '#334155', // Dark gray
    800: '#1e293b', // Very dark gray
    900: '#0f172a', // Deep gray
  },

  // Accent colors
  accent: {
    blue: '#3b82f6', // Bright blue
    green: '#10b981', // Emerald green
    yellow: '#f59e0b', // Amber yellow
    red: '#ef4444', // Bright red
    purple: '#8b5cf6', // Violet purple
    pink: '#ec4899', // Rose pink
    orange: '#f97316', // Orange
    teal: '#14b8a6', // Teal
  },

  // Semantic colors
  semantic: {
    success: '#10b981', // Green for success
    warning: '#f59e0b', // Yellow for warnings
    error: '#ef4444', // Red for errors
    info: '#3b82f6', // Blue for info
  },

  // Neutral grays
  gray: {
    50: '#f9fafb', // Snow white
    100: '#f3f4f6', // Ghost white
    200: '#e5e7eb', // Light gray
    300: '#d1d5db', // Silver gray
    400: '#9ca3af', // Medium gray
    500: '#6b7280', // Gray
    600: '#4b5563', // Dark gray
    700: '#374151', // Charcoal
    800: '#1f2937', // Dark charcoal
    900: '#111827', // Almost black
  },

  // Common UI colors
  ui: {
    background: '#ffffff', // White background
    surface: '#f9fafb', // Light gray surface
    border: '#e5e7eb', // Light gray border
    divider: '#f3f4f6', // Very light gray divider
    shadow: '#000000', // Black shadow
    overlay: '#000000', // Black overlay
  },

  // Text colors
  text: {
    primary: '#111827', // Dark gray for primary text
    secondary: '#6b7280', // Medium gray for secondary text
    tertiary: '#9ca3af', // Light gray for tertiary text
    inverse: '#ffffff', // White for inverse text
    disabled: '#d1d5db', // Light gray for disabled text
  },

  // Status colors
  status: {
    online: '#10b981', // Green for online status
    offline: '#6b7280', // Gray for offline status
    busy: '#f59e0b', // Yellow for busy status
    away: '#f97316', // Orange for away status
  },

  // Social media colors
  social: {
    facebook: '#1877f2', // Facebook blue
    twitter: '#1da1f2', // Twitter blue
    instagram: '#e4405f', // Instagram pink
    linkedin: '#0077b5', // LinkedIn blue
    youtube: '#ff0000', // YouTube red
    github: '#333333', // GitHub dark gray
  },

  // Material Design colors (common ones)
  material: {
    red: '#f44336', // Material red
    pink: '#e91e63', // Material pink
    purple: '#9c27b0', // Material purple
    deepPurple: '#673ab7', // Material deep purple
    indigo: '#3f51b5', // Material indigo
    blue: '#2196f3', // Material blue
    lightBlue: '#03a9f4', // Material light blue
    cyan: '#00bcd4', // Material cyan
    teal: '#009688', // Material teal
    green: '#4caf50', // Material green
    lightGreen: '#8bc34a', // Material light green
    lime: '#cddc39', // Material lime
    yellow: '#ffeb3b', // Material yellow
    amber: '#ffc107', // Material amber
    orange: '#ff9800', // Material orange
    deepOrange: '#ff5722', // Material deep orange
    brown: '#795548', // Material brown
    grey: '#9e9e9e', // Material grey
    blueGrey: '#607d8b', // Material blue grey
  },

  // Common brand colors
  brand: {
    apple: '#000000', // Apple black
    google: '#4285f4', // Google blue
    microsoft: '#00a4ef', // Microsoft blue
    amazon: '#ff9900', // Amazon orange
    netflix: '#e50914', // Netflix red
    spotify: '#1db954', // Spotify green
  },

  // Accessibility colors
  accessibility: {
    highContrast: '#000000', // High contrast black
    lowContrast: '#666666', // Low contrast gray
    focusRing: '#3b82f6', // Blue focus ring
  },

  // Human-readable color names
  human: {
    transparent: 'transparent',
    semiTransparent: 'rgba(0, 0, 0, 0.5)',
    // Reds
    fireEngineRed: '#ff0000',
    crimson: '#dc143c',
    tomato: '#ff6347',
    coral: '#ff7f50',
    salmon: '#fa8072',
    lightCoral: '#f08080',

    // Oranges
    orange: '#ffa500',
    darkOrange: '#ff8c00',
    goldenrod: '#daa520',
    gold: '#ffd700',
    yellow: '#ffff00',
    khaki: '#f0e68c',

    // Greens
    lime: '#00ff00',
    limeGreen: '#32cd32',
    forestGreen: '#228b22',
    green: '#008000',
    darkGreen: '#006400',
    seaGreen: '#2e8b57',
    mediumSeaGreen: '#3cb371',
    springGreen: '#00ff7f',
    lightGreen: '#90ee90',
    paleGreen: '#98fb98',
    darkSeaGreen: '#8fbc8f',
    mediumSpringGreen: '#00fa9a',
    mediumAquamarine: '#66cdaa',
    aquamarine: '#7fffd4',
    lightSeaGreen: '#20b2aa',
    mediumTurquoise: '#48d1cc',
    turquoise: '#40e0d0',
    aqua: '#00ffff',
    cyan: '#00ffff',
    lightCyan: '#e0ffff',
    paleTurquoise: '#afeeee',
    powderBlue: '#b0e0e6',
    lightBlue: '#add8e6',
    skyBlue: '#87ceeb',
    lightSkyBlue: '#87cefa',
    deepSkyBlue: '#00bfff',
    dodgerBlue: '#1e90ff',
    cornflowerBlue: '#6495ed',
    steelBlue: '#4682b4',
    royalBlue: '#4169e1',
    blue: '#0000ff',
    mediumBlue: '#0000cd',
    darkBlue: '#00008b',
    navy: '#000080',
    midnightBlue: '#191970',

    // Purples
    lavender: '#e6e6fa',
    thistle: '#d8bfd8',
    plum: '#dda0dd',
    violet: '#ee82ee',
    orchid: '#da70d6',
    fuchsia: '#ff00ff',
    magenta: '#ff00ff',
    mediumOrchid: '#ba55d3',
    mediumPurple: '#9370db',
    blueViolet: '#8a2be2',
    darkViolet: '#9400d3',
    darkOrchid: '#9932cc',
    darkMagenta: '#8b008b',
    purple: '#800080',
    indigo: '#4b0082',
    darkSlateBlue: '#483d8b',
    slateBlue: '#6a5acd',
    mediumSlateBlue: '#7b68ee',

    // Pinks
    pink: '#ffc0cb',
    lightPink: '#ffb6c1',
    hotPink: '#ff69b4',
    deepPink: '#ff1493',
    mediumVioletRed: '#c71585',
    paleVioletRed: '#db7093',

    // Browns
    brown: '#a52a2a',
    maroon: '#800000',
    saddleBrown: '#8b4513',
    sienna: '#a0522d',
    chocolate: '#d2691e',
    darkGoldenrod: '#b8860b',
    peru: '#cd853f',
    rosyBrown: '#bc8f8f',
    tan: '#d2b48c',
    burlywood: '#deb887',
    wheat: '#f5deb3',
    navajoWhite: '#ffdead',
    bisque: '#ffe4c4',
    blanchedAlmond: '#ffebcd',
    cornsilk: '#fff8dc',

    // Grays and Whites
    gray: '#808080',
    dimGray: '#696969',
    lightGray: '#d3d3d3',
    silver: '#c0c0c0',
    darkGray: '#a9a9a9',
    gainsboro: '#dcdcdc',
    whiteSmoke: '#f5f5f5',
    white: '#ffffff',
    snow: '#fffafa',
    honeydew: '#f0fff0',
    mintCream: '#f5fffa',
    azure: '#f0ffff',
    aliceBlue: '#f0f8ff',
    ghostWhite: '#f8f8ff',
    seashell: '#fff5ee',
    beige: '#f5f5dc',
    oldLace: '#fdf5e6',
    floralWhite: '#fffaf0',
    ivory: '#fffff0',
    antiqueWhite: '#faebd7',
    linen: '#faf0e6',
    lavenderBlush: '#fff0f5',
    mistyRose: '#ffe4e1',

    // Blacks and Dark Colors
    black: '#000000',
    darkSlateGray: '#2f4f4f',
    slateGray: '#708090',
    lightSlateGray: '#778899',
  },
} as const;

export type ColorKey = keyof typeof colors;
export type ColorValue = (typeof colors)[ColorKey];
