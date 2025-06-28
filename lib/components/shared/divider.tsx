import { ThemedView, ThemedViewProps } from '@components/shared';
import { colors } from '@styles';
import { ColorValue } from 'react-native';

interface DividerProps extends Omit<ThemedViewProps, 'style'> {
  color?: ColorValue;
  width?: number;
}
export const Divider = ({ color = colors.human.white, width = 1, ...props }: DividerProps) => {
  return <ThemedView style={{ borderColor: color, borderBottomWidth: width }} {...props} />;
};
