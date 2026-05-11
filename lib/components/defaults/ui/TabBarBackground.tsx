import { Colors } from '@components/defaults/constants/Colors';
import { useColorScheme } from '@styles/hooks/useColorScheme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { memo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';


const BlurTabBarBackground = memo(function BlurTabBarBackground() {
  return (
    <BlurView
      tint="systemChromeMaterial"
      intensity={100}
      style={StyleSheet.absoluteFill}
    />
  );
});

const SolidTabBarBackground = memo(function SolidTabBarBackground() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: Colors[colorScheme].background },
      ]}
    />
  );
});

const TabBarBackground = memo(function TabBarBackground() {
  if (Platform.OS === 'ios') {
    return <BlurTabBarBackground />;
  }

  return <SolidTabBarBackground />;
});

export default TabBarBackground;

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
