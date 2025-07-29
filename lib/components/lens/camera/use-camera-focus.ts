import { Dimensions } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Point, Camera as VisionCamera } from 'react-native-vision-camera';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const useCameraFocus = (camera: React.RefObject<VisionCamera | null>) => {
  const focusX = useSharedValue(0);
  const focusY = useSharedValue(0);
  const focusScale = useSharedValue(0);
  const focusOpacity = useSharedValue(0);

  const focusCamera = (point: Point) => {
    camera.current?.focus(point);
  };

  const handleFocusTap = (x: number, y: number) => {
    // Convert screen coordinates to relative coordinates (0-1)
    const relativeX = x / screenWidth;
    const relativeY = y / screenHeight;

    // Update focus position
    focusX.value = relativeX;
    focusY.value = relativeY;

    // Entry animation: scale from 0 to 1.2 then settle to 1, then exit after delay
    focusScale.value = withSequence(
      withSpring(1.2, { damping: 15, stiffness: 300 }),
      withSpring(1, { damping: 15, stiffness: 300 }),
      withDelay(1000, withTiming(0.8, { duration: 300 }))
    );

    // Opacity animation: fade in quickly, then fade out after delay
    focusOpacity.value = withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(1000, withTiming(0, { duration: 300 }))
    );

    // Focus the camera
    focusCamera({ x, y });
  };
  // Animated style for focus indicator
  const focusIndicatorAnimatedStyle = useAnimatedStyle(() => ({
    left: `${focusX.value * 100}%`,
    top: `${focusY.value * 100}%`,
    opacity: focusOpacity.value,
    transform: [{ translateX: -40 }, { translateY: -40 }, { scale: focusScale.value }],
  }));

  return { handleFocusTap, focusIndicatorAnimatedStyle };
};
