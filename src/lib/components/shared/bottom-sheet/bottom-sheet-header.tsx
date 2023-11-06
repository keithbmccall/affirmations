import { Icon, IconProps, Text, useTheme } from '@rneui/themed';
import { FC } from 'react';
import { TouchableOpacity, View } from 'react-native';

export interface BottomSheetHeaderProps {
  leadingIconProps?: IconProps;
  onClose: () => void;
  title: string;
}
const defaultLeadingIconProps: IconProps = {
  name: 'close',
  size: 30,
};
export const BottomSheetHeader: FC<BottomSheetHeaderProps> = ({
  leadingIconProps: {
    color,
    onPress,
    ..._leadingIconProps
  } = defaultLeadingIconProps,
  onClose,
  title,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        padding: 15,
      }}
    >
      <TouchableOpacity onPress={onPress}>
        <Icon
          {..._leadingIconProps}
          color={(!_leadingIconProps && theme.colors.background) || undefined}
        />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 30,
        }}
      >
        {title}
      </Text>
      <TouchableOpacity onPress={onClose}>
        <Icon name="close" size={30} />
      </TouchableOpacity>
    </View>
  );
};
