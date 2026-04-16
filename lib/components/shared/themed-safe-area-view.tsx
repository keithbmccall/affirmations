import { SafeAreaView, type SafeAreaViewProps } from 'react-native-safe-area-context';
import { memo } from 'react';

import { useThemeColor } from '@styles';

export type ThemedSafeAreaViewProps = SafeAreaViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export const ThemedSafeAreaView = memo(({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedSafeAreaViewProps) => {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <SafeAreaView style={[{ backgroundColor }, style]} {...otherProps} />;
});
