import { getAssetsAsync } from 'expo-media-library';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export const useCameraRoll = (hasAllPermissions: boolean) => {
  const [recentMedia, setRecentMedia] = useState<string | null>(null);

  // Animation values for photo transition
  const mediaOpacity = useSharedValue(1);
  const mediaScale = useSharedValue(1);
  // Animated style for photo transition
  const animatedPhotoStyle = useAnimatedStyle(() => ({
    opacity: mediaOpacity.value,
    transform: [{ scale: mediaScale.value }],
  }));
  // Open camera roll/photo library
  const handleCameraRollPress = useCallback(async () => {
    try {
      console.log('camera roll will launch!');
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera roll');
    }
  }, []);

  // Fetch most recent photo from library
  const fetchRecentMedia = useCallback(async () => {
    try {
      if (hasAllPermissions) {
        const result = await getAssetsAsync({
          first: 1,
          mediaType: ['photo', 'video'],
          sortBy: ['creationTime'],
        });

        if (result.assets.length > 0) {
          const newMediaUri = result.assets[0].uri;
          if (recentMedia && newMediaUri !== recentMedia) {
            mediaOpacity.value = 0;
            mediaScale.value = 0.8;

            setRecentMedia(newMediaUri);

            mediaOpacity.value = withTiming(1, { duration: 400 });
            mediaScale.value = withTiming(1, { duration: 400 });
          } else {
            setRecentMedia(newMediaUri);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching recent photo:', error);
    }
  }, [hasAllPermissions, recentMedia, mediaOpacity, mediaScale]);
  return {
    animatedPhotoStyle,
    handleCameraRollPress,
    fetchRecentMedia,
    recentMedia,
  };
};
