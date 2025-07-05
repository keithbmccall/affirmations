import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';

import { useThemeColor } from '@styles';

export type ThemedButtonProps = TouchableOpacityProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedButton({ style, lightColor, darkColor, ...otherProps }: ThemedButtonProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <TouchableOpacity
      style={[{ backgroundColor }, style]}
      accessibilityRole="button"
      {...otherProps}
    />
  );
}
