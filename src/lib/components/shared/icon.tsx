import { IconProps } from '@rneui/themed';
import { FC } from 'react';
import { TouchableOpacity } from 'react-native';

export enum Icons {
  CLOSE = 'close',
  TRASH = 'delete',
}
export const Icon: FC<IconProps> = ({
  color,
  name = Icons.CLOSE,
  onPress,
  size = 30,
}) => {
  return onPress ? (
    <TouchableOpacity onPress={onPress}>
      <Icon name={name} size={size} color={color} />
    </TouchableOpacity>
  ) : (
    <Icon name={name} size={size} color={color} />
  );
};
