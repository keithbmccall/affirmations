import { Colors } from '@components/defaults/constants/Colors';
import { HapticTab } from '@components/defaults/HapticTab';
import TabBarBackground from '@components/defaults/ui/TabBarBackground';
import { IconSymbol } from '@components/shared/icon-symbol/icon-symbol';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Routes } from '@routes/routes';
import { useColorScheme } from '@styles/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import { useMemo } from 'react';

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

  const screens = useMemo(() => {
    return screensList.map(screen => {
      return (
        <Tabs.Screen
          key={screen.name}
          name={screen.name}
          options={{
            title: screen.title,
            tabBarIcon: ({ color }) => <IconSymbol size={28} name={screen.icon} color={color} />,
            tabBarStyle: {
              display: screen.name === Routes.tabs.lens.name ? 'none' : undefined,
            },
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
    };
  }, [colorScheme]);

  return <Tabs screenOptions={screenOptions}>{screens}</Tabs>;
}
