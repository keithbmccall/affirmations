import { useTheme } from '@rneui/themed';
import { globalStyles } from '@theme';
import { FC, PropsWithChildren } from 'react';
import { View, ViewStyle } from 'react-native';

interface PillContainerProps {
  style?: ViewStyle;
}

export const PillContainer: FC<PropsWithChildren<PillContainerProps>> = ({
  style,
  children,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          borderWidth: 3,
          ...globalStyles.br10,
          borderColor: theme.colors.grey5,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
