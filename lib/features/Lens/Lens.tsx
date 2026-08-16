import { IconSymbol } from '@components/shared/icon-symbol/IconSymbol';
import { ThemedText } from '@components/shared/ThemedText';
import { ThemedView } from '@components/shared/ThemedView';
import { Camera } from '@features/Lens/Camera/Camera';
import { useCameraRollPrefetch } from '@features/Lens/Camera/hooks/useCameraRollPrefetch';
import { useLensPermissions } from '@features/Lens/Camera/hooks/useLensPermissions';
import { useInitLensPalettes } from '@features/Lens/ColorPalette/useInitLensPalettes';
import { colors } from '@styles/colors';
import { globalStyles } from '@styles/globalStyles';
import { spacing } from '@styles/spacing';
import type { ScreenContainerProps } from '@shared-types/ScreenContainerProps';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { memo, useCallback, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LensProps = ScreenContainerProps;

const LensGrantedContent = memo(function LensGrantedContent() {
  useCameraRollPrefetch();

  return <Camera />;
});

export const Lens = memo(function Lens({ statusBarProps }: LensProps) {
  useInitLensPalettes();
  const insets = useSafeAreaInsets();
  const { cameraPermission, microphonePermission, mediaLibraryPermission } = useLensPermissions();

  const hasAllPermissions = cameraPermission && microphonePermission && mediaLibraryPermission;

  const handleBackPress = useCallback(() => router.back(), []);
  const backButtonStyle = useMemo(() => [styles.backButton, { top: insets.top }], [insets.top]);

  // TODO: wrap with lens provider
  return (
    <ThemedView style={styles.container}>
      <StatusBar {...statusBarProps} />
      {hasAllPermissions ? (
        <LensGrantedContent />
      ) : (
        <View style={styles.permissionsShell} testID="lens-permissions-required">
          <ThemedText style={styles.permissionsMessage} accessibilityRole="text">
            Camera permission required
          </ThemedText>
          <TouchableOpacity
            testID="lens-back-button"
            style={backButtonStyle}
            onPress={handleBackPress}
          >
            <IconSymbol
              size={globalStyles.symbolSize}
              color={colors.human.white}
              name="chevron.left"
            />
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    ...globalStyles.flex1,
  },
  permissionsShell: {
    ...globalStyles.flex1,
    ...globalStyles.relative,
    backgroundColor: colors.human.black,
  },
  permissionsMessage: {
    ...globalStyles.absoluteFill,
    ...globalStyles.flexCenter,
    color: colors.human.white,
  },
  backButton: {
    ...globalStyles.absolute,
    left: 0,
    marginHorizontal: spacing['2xl'],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.human.semiTransparent,
    ...globalStyles.justifyCenter,
    ...globalStyles.alignCenter,
    zIndex: 10,
  },
});
