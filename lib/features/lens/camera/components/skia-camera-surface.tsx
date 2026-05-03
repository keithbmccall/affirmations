import { SKIA_COLOR_MODE, type SkiaColorMode } from '@features/lens/camera/camera-options';
import { buildTameRedSaturationColorMatrix } from '@features/lens/camera/skia-tame-red-config';
import { Skia, TileMode } from '@shopify/react-native-skia';
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

/**
 * Blur strength (Gaussian sigma). Higher = heavier preview + more GPU work per frame.
 * If the app gets hot or crashes in Skia mode, lower this before changing FPS.
 */
const BLUR_SIGMA = 50;
/** Linear contrast around mid-gray (`t = 0.5 * (1 - c)`). 1.0 = neutral; above 1 increases punch. */
const CONTRAST = 1.5;
const SATURATION = 5;

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
  const lensPaint = useMemo(() => {
    const c = CONTRAST;
    const t = 0.5 * (1 - c);
    const contrastFilter = Skia.ColorFilter.MakeMatrix([
      c,
      0,
      0,
      0,
      t,
      0,
      c,
      0,
      0,
      t,
      0,
      0,
      c,
      0,
      t,
      0,
      0,
      0,
      1,
      0,
    ]);

    const lr = 0.213;
    const lg = 0.715;
    const lb = 0.072;
    const s = SATURATION;
    const sr = (1 - s) * lr;
    const sg = (1 - s) * lg;
    const sb = (1 - s) * lb;

    let saturationFilter;
    if (colorMode === SKIA_COLOR_MODE.TAME_RED) {
      saturationFilter = Skia.ColorFilter.MakeMatrix(buildTameRedSaturationColorMatrix(SATURATION));
    } else {
      saturationFilter = Skia.ColorFilter.MakeMatrix([
        sr + s,
        sg,
        sb,
        0,
        0,
        sr,
        sg + s,
        sb,
        0,
        0,
        sr,
        sg,
        sb + s,
        0,
        0,
        0,
        0,
        0,
        1,
        0,
      ]);
    }

    const colorFilter = Skia.ColorFilter.MakeCompose(saturationFilter, contrastFilter);
    const colorImageFilter = Skia.ImageFilter.MakeColorFilter(colorFilter, null);
    const blurFilter = Skia.ImageFilter.MakeBlur(BLUR_SIGMA, BLUR_SIGMA, TileMode.Clamp, null);
    const composed = Skia.ImageFilter.MakeCompose(blurFilter, colorImageFilter);

    const paint = Skia.Paint();
    paint.setImageFilter(composed);
    return paint;
  }, [colorMode]);

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
