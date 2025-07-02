import { ThemedView } from '@components/shared';
import { colors } from '@styles';
import { ColorValue, StyleSheet } from 'react-native';

interface DividerProps {
  color: ColorValue;
}
export const Divider = ({ color }: DividerProps) => {
  return <ThemedView style={[styles.divider, color && { borderColor: color }]} />;
};

const styles = StyleSheet.create({
  divider: {
    borderBottomWidth: 1,
    borderColor: colors.human.white,
  },
});
