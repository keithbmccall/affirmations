import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

function getProjectId(): string | null {
  // Try multiple sources for the project ID
  const sources = [
    Constants?.expoConfig?.extra?.eas?.projectId,
    Constants?.easConfig?.projectId,
    Constants?.expoConfig?.extra?.projectId,
    // Fallback to the known project ID if all else fails
    'b6f11482-5e3a-4128-bc25-1c2468552783',
  ];

  for (const source of sources) {
    if (source) {
      console.log('Found projectId from source:', source);
      return source;
    }
  }

  return null;
}

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      console.log('Constants.expoConfig:', Constants.expoConfig);
      console.log('Constants.easConfig:', Constants.easConfig);
      console.log('Constants.expoConfig?.extra:', Constants.expoConfig?.extra);
      console.log('Constants.expoConfig?.extra?.eas:', Constants.expoConfig?.extra?.eas);

      const projectId = getProjectId();
      console.log('Found projectId:', projectId);

      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      console.error('Error getting push token:', e);
      token = `${e}`;
    }
  } else {
    Alert.alert('Must use physical device for Push Notifications');
  }

  return token;
}
