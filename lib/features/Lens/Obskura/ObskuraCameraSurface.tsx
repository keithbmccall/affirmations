import { createObskuraLensPaint } from '@features/Lens/Obskura/createObskuraLensPaint';
import { type ObskuraColorMode } from '@features/Lens/Obskura/options';
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

interface ObskuraCameraSurfaceProps {
  cameraRef: React.RefObject<VisionCamera | null>;
  device: CameraDevice;
  isActive: boolean;
  fps: number;
  colorMode: ObskuraColorMode;
}

export const ObskuraCameraSurface = ({
  cameraRef,
  device,
  isActive,
  fps,
  colorMode,
}: ObskuraCameraSurfaceProps) => {
  const lensPaint = useMemo(() => createObskuraLensPaint(colorMode), [colorMode]);

  useEffect(() => {
    return () => {
      lensPaint.dispose();
    };
  }, [lensPaint]);

  const frameProcessor = useSkiaFrameProcessor(
    frame => {
      'worklet';
      /* istanbul ignore next -- frame.render runs on device only */
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
