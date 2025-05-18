import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useDimensions = () => {
  const { bottom: safeAreaBottom, top: safeAreaTop } = useSafeAreaInsets();
  const { height: screenHeight } = useWindowDimensions();
  const [dimension, setDimension] = useState<number | 'auto'>('auto');

  const setRemainingHeight = (elementHeight: number) =>
    setDimension(screenHeight - (elementHeight + safeAreaBottom + safeAreaTop));

  return {
    remainingHeight: dimension,
    safeAreaBottom,
    safeAreaTop,
    screenHeight,
    setRemainingHeight,
  };
};
