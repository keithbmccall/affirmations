import { useThemeColor } from '@styles/hooks/useThemeColor';
import { memo } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  value?: string;
};

export const ThemedInput = memo(function ThemedInput({
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
});

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minWidth: 200,
  },
});
