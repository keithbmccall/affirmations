import { createTheme } from '@rneui/themed';
import { textStyles } from './text';
import { StyleType } from './types';

export const globalStyles: StyleType = {
  justifyCenter: { alignItems: 'center', justifyContent: 'center' },
  ...textStyles,
};

export const Theme = createTheme({
  lightColors: {
    primary: '#e7e7e8',
    background: '#e7e7e8',
  },
  darkColors: {
    primary: '#222260',
    background: '#232222',
    white: '#ffffff',
    grey5: '#2f3131',
    grey4: '#3d3c3c',
    grey3: '#868a8a',
  },
  mode: 'dark',
});
