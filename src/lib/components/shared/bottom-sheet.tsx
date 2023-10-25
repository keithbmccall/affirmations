import { Icon, Text, useTheme } from '@rneui/themed';
import { FC, ReactNode } from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface BottomSheetProps {
  children: ReactNode;
  containerStyle?: ViewStyle;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}
export const BottomSheet: FC<BottomSheetProps> = ({
  children,
  containerStyle,
  isOpen,
  onClose,
  title,
}) => {
  const { theme } = useTheme();
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  return (
    <>
      <Modal
        isVisible={isOpen}
        onBackdropPress={onClose}
        onSwipeComplete={onClose}
        swipeDirection="down"
        style={{
          justifyContent: 'flex-end',
          marginHorizontal: 0,
          marginBottom: 0,
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.background,
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
            borderColor: theme.colors.white,
            borderWidth: 2,
            borderBottomWidth: 0,
            paddingBottom: safeAreaBottom,
          }}
        >
          <View
            style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
              padding: 15,
            }}
          >
            <Icon name="close" size={30} color={theme.colors.background} />
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
          <View style={containerStyle}>{children}</View>
        </View>
      </Modal>
    </>
  );
};
