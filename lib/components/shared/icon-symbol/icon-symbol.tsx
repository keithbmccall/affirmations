// Fallback for using MaterialIcons on Android and web.
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { memo } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import { ICON_MAPPING } from './icon-mapping';

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export const IconSymbol = memo(({
  name,
  size = 24,
  color,
  style,
}: {
  name: keyof typeof ICON_MAPPING;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) => {
  return <MaterialIcons color={color} size={size} name={ICON_MAPPING[name]} style={style} />;
});
