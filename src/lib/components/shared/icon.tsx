import { IconProps } from '@rneui/themed';
import { FC } from 'react';
import { TouchableOpacity } from 'react-native';

export enum Icons {
  CLOSE = 'close',
  TRASH = 'delete',
}
export const Icon: FC<IconProps> = ({ onPress, name = Icons.CLOSE }) => {
  return onPress ? (
    <TouchableOpacity onPress={onPress}>
      <Icon name={name} size={30} />
    </TouchableOpacity>
  ) : (
    <Icon name={name} size={30} />
  );
};
