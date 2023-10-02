import { createTheme } from '@rneui/themed';

export const Theme = createTheme({
  lightColors: {
    primary: '#e7e7e8',
    background: '#e7e7e8',
  },
  darkColors: {
    primary: '#222260',
    background: '#232222',
  },
  components: {
    Button: {
      buttonStyle: {
        borderStyle: 'dotted',
        borderWidth: 5,
        borderColor: 'gold',
      },
    },
  },
  mode: 'dark',
});
