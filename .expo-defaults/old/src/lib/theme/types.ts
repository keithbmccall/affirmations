import { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type ElementStyle = ViewStyle | ImageStyle | TextStyle
export type StyleType = Record<string, ElementStyle>;
