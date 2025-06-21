import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useThemeColor } from '@/lib/styles/hooks/useThemeColor';

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  value?: string;
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  value = '',
  ...rest
}: ThemedInputProps) {
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <TextInput
      style={[
        {
          color: textColor,
          backgroundColor,
        },
        styles.input,
        style,
      ]}
      defaultValue={value}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minWidth: 200,
  },
});
