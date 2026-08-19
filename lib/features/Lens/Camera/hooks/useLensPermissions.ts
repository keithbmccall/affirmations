import { usePermissions as useMediaLibraryPermissions } from 'expo-media-library';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useCameraPermission, useMicrophonePermission } from 'react-native-vision-camera';

export const useLensPermissions = () => {
  const [isPermissionsReady, setIsPermissionsReady] = useState(false);
  const [resolvedCameraAccess, setResolvedCameraAccess] = useState<boolean | undefined>();
  const [resolvedMicAccess, setResolvedMicAccess] = useState<boolean | undefined>();
  const { hasPermission: cameraPermission, requestPermission: requestCameraPermission } =
    useCameraPermission();
  const [mediaLibraryPermissionStatus, requestMediaLibraryPermission] =
    useMediaLibraryPermissions();
  const mediaLibraryPermission = Boolean(mediaLibraryPermissionStatus?.granted);
  const { hasPermission: microphonePermission, requestPermission: requestMicrophonePermission } =
    useMicrophonePermission();

  // Request permissions on mount
  useEffect(() => {
    let isMounted = true;

    const requestPermissions = async () => {
      try {
        const cameraGranted = cameraPermission || (await requestCameraPermission());
        const micGranted = microphonePermission || (await requestMicrophonePermission());

        if (!mediaLibraryPermission) {
          await requestMediaLibraryPermission();
        }

        if (isMounted) {
          setResolvedCameraAccess(cameraGranted);
          setResolvedMicAccess(micGranted);
        }
      } catch (error) {
        console.error('Permission request failed:', error);
        Alert.alert(
          'Permissions Required',
          'Camera and microphone and media library permissions are required to use this feature.',
          [{ text: 'OK' }]
        );
      } finally {
        if (isMounted) {
          setIsPermissionsReady(true);
        }
      }
    };

    void requestPermissions();

    return () => {
      isMounted = false;
    };
  }, [
    cameraPermission,
    mediaLibraryPermission,
    microphonePermission,
    requestCameraPermission,
    requestMediaLibraryPermission,
    requestMicrophonePermission,
  ]);

  const hasCameraAccess =
    (cameraPermission || resolvedCameraAccess) && (microphonePermission || resolvedMicAccess);

  return {
    cameraPermission,
    hasCameraAccess,
    isPermissionsReady,
    mediaLibraryPermission,
    requestCameraPermission,
    requestMediaLibraryPermission,
    requestMicrophonePermission,
    microphonePermission,
  };
};
