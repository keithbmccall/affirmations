import { Divider as Div } from '@rneui/themed';
import { FC } from 'react';
import { View } from 'react-native';

interface DividerProps {
  paddingVertical?: number;
}
export const Divider: FC<DividerProps> = ({ paddingVertical = 10 }) => {
  return (
    <View
      style={{
        paddingVertical,
      }}
    >
      <Div />
    </View>
  );
};
