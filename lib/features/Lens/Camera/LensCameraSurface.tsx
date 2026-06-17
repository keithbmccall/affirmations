import {
  ColorLensMode,
  isColorLensActive,
  isColorLensDominant,
  isColorLensPoint,
} from '@features/Lens/ColorPalette/colorLensMode';
import type { ColorLensRegionOptions } from '@features/Lens/ColorPalette/getColorLensRegion';
import Reanimated, { useSharedValue } from 'react-native-reanimated';
import {
  CameraDevice,
  Frame,
  useFrameProcessor,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import { StyleSheet } from 'react-native';

const ReanimatedCamera = Reanimated.createAnimatedComponent(VisionCamera);
Reanimated.addWhitelistedNativeProps({
  isActive: true,
});

export const COLOR_LENS_PALETTE_MIN_INTERVAL_MS = 1000;

const LENS_POINT_SAMPLE_RADIUS = 0.15;

interface LensCameraSurfaceProps {
  cameraRef: React.RefObject<VisionCamera | null>;
  device: CameraDevice;
  isActive: boolean;
  fps: number;
  colorLensMode: ColorLensMode;
  getColorLensPaletteWorklet: (frame: Frame) => void;
  getColorLensRegionWorklet?: (frame: Frame, options: ColorLensRegionOptions) => void;
}

export const LensCameraSurface = ({
  cameraRef,
  device,
  isActive,
  fps,
  colorLensMode,
  getColorLensPaletteWorklet,
  getColorLensRegionWorklet,
}: LensCameraSurfaceProps) => {
  const lastColorLensPaletteSampleMs = useSharedValue(0);
  const shouldSampleDominant = isColorLensDominant(colorLensMode);
  const shouldSamplePoint = isColorLensPoint(colorLensMode);
  const isColorLensModeActive = isColorLensActive(colorLensMode);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (!isActive) return;

      if (isColorLensModeActive) {
        const now = Date.now();
        if (now - lastColorLensPaletteSampleMs.value >= COLOR_LENS_PALETTE_MIN_INTERVAL_MS) {
          lastColorLensPaletteSampleMs.value = now;

          if (shouldSampleDominant) {
            getColorLensPaletteWorklet(frame);
          }

          if (shouldSamplePoint && getColorLensRegionWorklet !== undefined) {
            getColorLensRegionWorklet(frame, {
              centerX: 0.5,
              centerY: 0.5,
              radius: LENS_POINT_SAMPLE_RADIUS,
            });
          }
        }
      }
    },
    [
      isActive,
      isColorLensModeActive,
      shouldSampleDominant,
      shouldSamplePoint,
      getColorLensPaletteWorklet,
      getColorLensRegionWorklet,
    ]
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
