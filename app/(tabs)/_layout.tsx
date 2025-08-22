import { IconSymbol } from '@components/shared';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Routes } from '@routes';
import { useColorScheme } from '@styles';
import { Tabs, usePathname } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '../../.expo-defaults/components/HapticTab';
import TabBarBackground from '../../.expo-defaults/components/ui/TabBarBackground';
import { Colors } from '../../.expo-defaults/constants/Colors';

const screensList = [
  { name: Routes.tabs.home.name, title: Routes.tabs.home.title, icon: Routes.tabs.home.icon },
  { name: Routes.tabs.lens.name, title: Routes.tabs.lens.title, icon: Routes.tabs.lens.icon },
  {
    name: Routes.tabs.affirmations.name,
    title: Routes.tabs.affirmations.title,
    icon: Routes.tabs.affirmations.icon,
  },
];

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();

  // Check if current screen is lens
  const isLensScreen = pathname === `/${Routes.tabs.lens.name}`;

  const screens = useMemo(() => {
    return screensList.map(screen => {
      return (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name={screen.icon} color={color} />,
          }}
        />
      );
    });
  }, [screensList]);

  const screenOptions: BottomTabNavigationOptions = useMemo(() => {
    return {
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      headerShown: false,
      tabBarButton: HapticTab,
      tabBarBackground: TabBarBackground,
      tabBarStyle: Platform.select({
        ios: {
          // Use a transparent background on iOS to show the blur effect
          position: 'absolute',
          display: isLensScreen ? 'none' : undefined,
        },
        default: {},
      }),
    };
  }, [colorScheme, isLensScreen]);
  console.log('layout');
  return <Tabs screenOptions={screenOptions}>{screens}</Tabs>;
}
