import { usePermissions as useMediaLibraryPermissions } from 'expo-media-library';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';

export const useLensPermissions = () => {
  const { hasPermission: cameraPermission, requestPermission: requestCameraPermission } =
    useCameraPermission();
  const [mediaLibraryPermissionStatus, requestMediaLibraryPermission] =
    useMediaLibraryPermissions();
  const mediaLibraryPermission = Boolean(mediaLibraryPermissionStatus?.granted);
  const { hasPermission: microphonePermission, requestPermission: requestMicrophonePermission } =
    useMicrophonePermission();

  // Request permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Request camera permission if not granted
        if (!cameraPermission) {
          await requestCameraPermission();
        }

        // Request microphone permission if not granted
        if (!microphonePermission) {
          await requestMicrophonePermission();
        }

        if (!mediaLibraryPermission) {
          await requestMediaLibraryPermission();
        }
      } catch (error) {
        console.error('Permission request failed:', error);
        Alert.alert(
          'Permissions Required',
          'Camera and microphone and media library permissions are required to use this feature.',
          [{ text: 'OK' }]
        );
      }
    };

    requestPermissions();
  }, [
    cameraPermission,
    microphonePermission,
    requestCameraPermission,
    requestMicrophonePermission,
  ]);

  return {
    cameraPermission,
    mediaLibraryPermission,
    requestCameraPermission,
    requestMediaLibraryPermission,
    requestMicrophonePermission,
    microphonePermission,
  };
};
