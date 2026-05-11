import { StyleSheet } from 'react-native';
import Reanimated, { useSharedValue } from 'react-native-reanimated';
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

export const COLOR_LENS_PALETTE_MIN_INTERVAL_MS = 1000;

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
  const lastColorLensPaletteSampleMs = useSharedValue(0);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (!isActive) return;

      if (isColorLensEnabled) {
        const now = Date.now();
        if (now - lastColorLensPaletteSampleMs.value >= COLOR_LENS_PALETTE_MIN_INTERVAL_MS) {
          lastColorLensPaletteSampleMs.value = now;
          getColorLensPaletteWorklet(frame);
        }
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
