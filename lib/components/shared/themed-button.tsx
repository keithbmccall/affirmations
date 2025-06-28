import { Pressable, type PressableProps } from 'react-native';

import { useThemeColor } from '@styles';

export type ThemedButtonProps = PressableProps & {
  lightColor?: string;
  darkColor?: string;
  showPressFeedback?: boolean;
};

export function ThemedButton({
  style,
  lightColor,
  darkColor,
  showPressFeedback = true,
  ...otherProps
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <Pressable
      style={state => [
        { backgroundColor },
        typeof style === 'function' ? style(state) : style,
        showPressFeedback && state.pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
      {...otherProps}
    />
  );
}
