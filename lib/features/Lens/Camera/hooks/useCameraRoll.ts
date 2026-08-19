import { toInspectionAsset } from '@features/Lens/Camera/cameraRollPhotos/toInspectionAsset';
import { useLens } from '@platform';
import { Routes } from '@routes/routes';
import { getAssetsAsync, type Asset } from 'expo-media-library';
import { router } from 'expo-router';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

/** Assumes media-library access was granted at the Lens hallway before mount. */
export const useCameraRoll = () => {
  const { lensPalettesMap } = useLens();
  const [recentMedia, setRecentMedia] = useState<string | null>(null);
  const [recentAsset, setRecentAsset] = useState<Asset | null>(null);

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
      router.push(Routes.modals.lensCameraRoll.routePathname);
    } catch {
      Alert.alert('Error', 'Failed to open camera roll');
    }
  }, []);

  const handleCameraRollLongPress = useCallback(async () => {
    if (recentAsset === null) {
      return;
    }

    try {
      const item = toInspectionAsset(recentAsset, lensPalettesMap[recentAsset.id]);
      router.push({
        pathname: Routes.subRoutes.cameraRollInspector.routePathname,
        params: { asset: JSON.stringify(item) },
      });
    } catch {
      Alert.alert('Error', 'Failed to open photo');
    }
  }, [recentAsset, lensPalettesMap]);

  // Fetch most recent photo from library
  const fetchRecentMedia = useCallback(async () => {
    try {
      const result = await getAssetsAsync({
        first: 1,
        mediaType: ['photo', 'video'],
        sortBy: ['creationTime'],
      });

      if (result.assets.length > 0) {
        const asset = result.assets[0];
        const newMediaUri = asset.uri;
        if (recentMedia && newMediaUri !== recentMedia) {
          mediaOpacity.value = 0;
          mediaScale.value = 0.8;

          setRecentMedia(newMediaUri);
          setRecentAsset(asset);

          mediaOpacity.value = withTiming(1, { duration: 400 });
          mediaScale.value = withTiming(1, { duration: 400 });
        } else {
          setRecentMedia(newMediaUri);
          setRecentAsset(asset);
        }
      }
    } catch (error) {
      console.error('Error fetching recent photo:', error);
    }
  }, [recentMedia, mediaOpacity, mediaScale]);
  return {
    animatedPhotoStyle,
    handleCameraRollPress,
    handleCameraRollLongPress,
    fetchRecentMedia,
    recentMedia,
  };
};
