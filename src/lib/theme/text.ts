import { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export const textStyles: Record<string, ViewStyle | ImageStyle | TextStyle> = {
  bigText: {
    fontSize: 40,
  },
  smallText: {
    fontSize: 10,
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
