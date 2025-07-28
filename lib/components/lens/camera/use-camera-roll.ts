import { launchImageLibraryAsync } from 'expo-image-picker';
import { getAssetsAsync } from 'expo-media-library';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export const useCameraRoll = (hasAllPermissions: boolean) => {
  const [recentPhoto, setRecentPhoto] = useState<string | null>(null);

  // Animation values for photo transition
  const photoOpacity = useSharedValue(1);
  const photoScale = useSharedValue(1);
  // Animated style for photo transition
  const animatedPhotoStyle = useAnimatedStyle(() => ({
    opacity: photoOpacity.value,
    transform: [{ scale: photoScale.value }],
  }));
  // Open camera roll/photo library
  const handleCameraRollPress = useCallback(async () => {
    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        // Handle selected image - you can add your logic here
        Alert.alert('Image Selected', `Selected: ${result.assets[0].uri}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera roll');
    }
  }, []);

  // Fetch most recent photo from library
  const fetchRecentPhoto = useCallback(async () => {
    try {
      if (hasAllPermissions) {
        const result = await getAssetsAsync({
          first: 1,
          mediaType: 'photo',
          sortBy: ['creationTime'],
        });

        if (result.assets.length > 0) {
          const newPhotoUri = result.assets[0].uri;

          // Only animate if the photo actually changed
          if (recentPhoto && newPhotoUri !== recentPhoto) {
            // Reset animation values
            photoOpacity.value = 0;
            photoScale.value = 0.8;

            // Update state first
            setRecentPhoto(newPhotoUri);

            // Then animate in the new photo
            photoOpacity.value = withTiming(1, { duration: 400 });
            photoScale.value = withTiming(1, { duration: 400 });
          } else {
            setRecentPhoto(newPhotoUri);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching recent photo:', error);
    }
  }, [hasAllPermissions, recentPhoto, photoOpacity, photoScale]);
  return {
    animatedPhotoStyle,
    handleCameraRollPress,
    fetchRecentPhoto,
    recentPhoto,
  };
};
