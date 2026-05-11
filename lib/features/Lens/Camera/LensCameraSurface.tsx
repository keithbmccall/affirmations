import { StyleSheet } from 'react-native';
import Reanimated from 'react-native-reanimated';
import {
  CameraDevice,
  Frame,
  useFrameProcessor,
  Camera as VisionCamera,
} from 'react-native-vision-camera';

const ReanimatedCamera = Reanimated.createAnimatedComponent(VisionCamera);
Reanimated.addWhitelistedNativeProps({
  isActive: true,
});

interface LensCameraSurfaceProps {
  cameraRef: React.RefObject<VisionCamera | null>;
  device: CameraDevice;
  isActive: boolean;
  fps: number;
  isColorLensEnabled: boolean;
  getColorLensPaletteWorklet: (frame: Frame) => void;
}

export const LensCameraSurface = ({
  cameraRef,
  device,
  isActive,
  fps,
  isColorLensEnabled,
  getColorLensPaletteWorklet,
}: LensCameraSurfaceProps) => {
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (!isActive) return;

      if (isColorLensEnabled) {
        getColorLensPaletteWorklet(frame);
      }
    },
    [isActive, isColorLensEnabled]
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
