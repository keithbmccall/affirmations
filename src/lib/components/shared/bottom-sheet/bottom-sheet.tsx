import { useTheme } from '@rneui/themed';
import { FC, ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetHeader } from './bottom-sheet-header';

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
          <BottomSheetHeader onClose={onClose} title={title} />
          <View style={containerStyle}>{children}</View>
        </View>
      </Modal>
    </>
  );
};