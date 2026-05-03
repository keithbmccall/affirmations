import { type SkiaColorMode } from '@features/lens/camera/camera-options';
import { createSkiaLensPaint } from '@features/lens/camera/createSkiaLensPaint';
import { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Reanimated from 'react-native-reanimated';
import {
  CameraDevice,
  useSkiaFrameProcessor,
  Camera as VisionCamera,
} from 'react-native-vision-camera';

const ReanimatedCamera = Reanimated.createAnimatedComponent(VisionCamera);
Reanimated.addWhitelistedNativeProps({
  isActive: true,
});

interface SkiaCameraSurfaceProps {
  cameraRef: React.RefObject<VisionCamera | null>;
  device: CameraDevice;
  isActive: boolean;
  fps: number;
  colorMode: SkiaColorMode;
}

export const SkiaCameraSurface = ({
  cameraRef,
  device,
  isActive,
  fps,
  colorMode,
}: SkiaCameraSurfaceProps) => {
  const lensPaint = useMemo(() => createSkiaLensPaint(colorMode), [colorMode]);

  useEffect(() => {
    return () => {
      lensPaint.dispose();
    };
  }, [lensPaint]);

  const frameProcessor = useSkiaFrameProcessor(
    frame => {
      'worklet';
      frame.render(lensPaint);
    },
    [lensPaint]
  );

  return (
    <ReanimatedCamera
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={isActive}
      photo
      video
      audio
      frameProcessor={isActive ? frameProcessor : undefined}
      fps={fps}
    />
  );
};
