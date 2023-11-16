import { useTheme } from '@rneui/themed';
import { FC, ReactNode } from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import Modal, { ModalProps } from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetHeader,
  BottomSheetHeaderProps,
} from './bottom-sheet-header';

export interface BottomSheetProps {
  avoidKeyboard?: ModalProps['avoidKeyboard'];
  children: ReactNode;
  containerStyle?: ViewStyle;
  headerProps?: Partial<BottomSheetHeaderProps>;
  isOpen: boolean;
  onClose: () => void;
  onLayout?: ViewProps['onLayout'];
  title: string;
}
export const BottomSheet: FC<BottomSheetProps> = ({
  avoidKeyboard = true,
  children,
  containerStyle,
  headerProps,
  isOpen,
  onClose,
  onLayout,
  title,
}) => {
  const { theme } = useTheme();
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  return (
    <Modal
      avoidKeyboard={avoidKeyboard}
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
        <BottomSheetHeader {...headerProps} onClose={onClose} title={title} />
        <View style={containerStyle} onLayout={onLayout}>
          {children}
        </View>
      </View>
    </Modal>
  );
};
