import { colors } from '@styles';
import { ColorValue } from 'react-native';
import { ThemedView, ThemedViewProps } from './themed-view';

interface DividerProps extends Omit<ThemedViewProps, 'style'> {
  color?: ColorValue;
  width?: number;
  vertical?: boolean;
}
export const Divider = ({
  color = colors.human.white,
  width = 1,
  vertical = false,
  ...props
}: DividerProps) => {
  return (
    <ThemedView
      style={[
        { borderColor: color },
        vertical ? { borderRightWidth: width } : { borderBottomWidth: width },
      ]}
      {...props}
    />
  );
};
