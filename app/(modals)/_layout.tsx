import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Routes } from '@routes';
import { Stack } from 'expo-router';
import { useMemo } from 'react';

export default function ModalLayout() {
  const screenOptions: NativeStackNavigationOptions = useMemo(() => {
    return {
      presentation: 'modal',
      headerShown: false,
    };
  }, []);
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name={Routes.modals.notificationDetails.name} />
      <Stack.Screen name={Routes.modals.lensCameraRoll.name} />
    </Stack>
  );
}
