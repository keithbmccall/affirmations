import { createTheme } from '@rneui/themed';
import { commonValues } from './common';
import { positionValues } from './spacing';
import { textStyles } from './text';
import { StyleType } from './types';

export const globalStyles: StyleType = {
  justifyCenter: { alignItems: 'center', justifyContent: 'center' },
  ...textStyles,
  ...positionValues,
  ...commonValues,
};

export const Theme = createTheme({
  lightColors: {
    primary: '#e7e7e8',
    background: '#e7e7e8',
  },
  darkColors: {
    primary: '#222260',
    background: '#232222',
    error: '#c91414',
    white: '#ffffff',
    grey5: '#2f3131',
    grey4: '#3d3c3c',
    grey3: '#868a8a',
  },
  mode: 'dark',
  components: {
    Input: {
      inputContainerStyle: { borderBottomWidth: 0 },
    },
  },
});
