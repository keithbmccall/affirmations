import { Stack, type NativeStackNavigationOptions } from 'expo-router';
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
