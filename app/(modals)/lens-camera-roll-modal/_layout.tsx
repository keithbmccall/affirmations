import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { Stack } from 'expo-router';
import { useMemo } from 'react';

export default function LensCameraRollModalLayout() {
  const screenOptions: NativeStackNavigationOptions = useMemo(
    () => ({
      headerShown: false,
    }),
    []
  );

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="camera-roll" />
      <Stack.Screen name="camera-roll-inspector" />
    </Stack>
  );
}
