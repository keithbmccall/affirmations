import { createTheme } from '@rneui/themed';
import { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export const globalStyles: Record<string, ViewStyle | ImageStyle | TextStyle> =
  {
    justifyCenter: { alignItems: 'center', justifyContent: 'center' },
    bigText: {
      fontSize: 40,
    },
    largeText: {
      fontSize: 30,
    },
    mediumText: {
      fontSize: 20,
    },
    mildText: {
      fontSize: 15,
    },
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
    grey3: '#868a8a',
  },
  components: {
    // Button: {
    //   buttonStyle: {
    //     borderStyle: 'dotted',
    //     borderWidth: 5,
    //     borderColor: 'gold',
    //   },
    // },
  },
  mode: 'dark',
});
