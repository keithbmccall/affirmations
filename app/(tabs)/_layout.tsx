import { HapticTab } from '@/.expo-defaults/components/HapticTab';
import TabBarBackground from '@/.expo-defaults/components/ui/TabBarBackground';
import { Colors } from '@/.expo-defaults/constants/Colors';
import { IconSymbol } from '@/lib/components/shared/icon-symbol/icon-symbol';
import { Routes } from '@/lib/routes';
import { useColorScheme } from '@/lib/styles/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name={Routes.home.name}
        options={{
          title: Routes.home.title,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name={Routes.home.icon} color={color} />,
        }}
      />
      <Tabs.Screen
        name={Routes.lens.name}
        options={{
          title: Routes.lens.title,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name={Routes.lens.icon} color={color} />,
        }}
      />
      <Tabs.Screen
        name={Routes.affirmations.name}
        options={{
          title: Routes.affirmations.title,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name={Routes.affirmations.icon} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
