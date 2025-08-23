import { Routes } from '@routes';
import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
        // animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen name={Routes.modals.notificationDetails.name} />
      <Stack.Screen name={Routes.modals.lensCameraRoll.name} />
    </Stack>
  );
}
