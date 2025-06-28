import { IconSymbol } from '@components';
import { Routes } from '@routes';
import { useColorScheme } from '@styles';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '../../.expo-defaults/components/HapticTab';
import TabBarBackground from '../../.expo-defaults/components/ui/TabBarBackground';
import { Colors } from '../../.expo-defaults/constants/Colors';

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
        // tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name={Routes.tabs.home.name}
        options={{
          title: Routes.tabs.home.title,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name={Routes.tabs.home.icon} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={Routes.tabs.lens.name}
        options={{
          title: Routes.tabs.lens.title,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name={Routes.tabs.lens.icon} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name={Routes.tabs.affirmations.name}
        options={{
          title: Routes.tabs.affirmations.title,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name={Routes.tabs.affirmations.icon} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
