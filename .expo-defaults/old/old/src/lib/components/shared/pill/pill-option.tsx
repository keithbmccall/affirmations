import { Text, useTheme } from '@rneui/themed';
import { FC } from 'react';
import { ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useStyles } from './styles';

interface PillProps {
  containerStyle?: ViewStyle;
  selectedContainerStyle?: ViewStyle;
  display: string;
  isSelected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}
export const PillOption: FC<PillProps> = ({
  containerStyle,
  display,
  isSelected,
  onPress,
  selectedContainerStyle,
  style,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  return (
    <TouchableOpacity
      style={[styles.option, style]}
      onPress={onPress}
      containerStyle={[
        styles.optionContainer,
        containerStyle,
        isSelected && styles.selectedOptionContainer,
        isSelected && selectedContainerStyle,
      ]}
    >
      <Text>{display}</Text>
    </TouchableOpacity>
  );
};
