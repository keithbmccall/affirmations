import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useTheme } from '@rneui/themed';
import { FC, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomSheetHeader,
  BottomSheetHeaderProps,
} from './bottom-sheet-header';

export interface BottomSheetProps {
  // avoidKeyboard?: ModalProps['avoidKeyboard'];
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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const { theme } = useTheme();
  const { bottom: safeAreaBottom } = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['25%', '50%'], []);
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  useEffect(() => {
    console.log('bs i n view');
    setTimeout(()=>{

        console.log('called!');
        bottomSheetModalRef.current?.present();
    },5000)

    return () => {
      console.log('bottomsheet has unmounted');
    };
  }, []);

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <BottomSheetView
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
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};
