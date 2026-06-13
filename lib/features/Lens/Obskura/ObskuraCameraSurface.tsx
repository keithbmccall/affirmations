import { buildObskuraLensPaintFromPipeline } from '@features/Lens/Obskura/pipeline/buildObskuraLensPaintFromPipeline';
import { OBSKURA_LENS_PIPELINE } from '@features/Lens/Obskura/pipeline/obskuraLensPipelineConfig';
import { type ObskuraColorMode } from '@features/Lens/Obskura/options';
import { memo, useEffect, useMemo } from 'react';

import { StyleSheet } from 'react-native';
import Reanimated from 'react-native-reanimated';
import {
  CameraDevice,
  Templates,
  useCameraFormat,
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

export const ObskuraCameraSurface = memo(function ObskuraCameraSurface({
  cameraRef,
  device,
  isActive,
  fps,
  colorMode,
}: ObskuraCameraSurfaceProps) {
  const formatFilters = useMemo(
    () => [{ fps }, ...Templates.FrameProcessing, { photoResolution: 'max' as const }],
    [fps]
  );
  const format = useCameraFormat(device, formatFilters);

  const lensPaint = useMemo(
    () => buildObskuraLensPaintFromPipeline(OBSKURA_LENS_PIPELINE, { colorMode }),
    [colorMode]
  );

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
      format={format}
      photo
      frameProcessor={isActive ? frameProcessor : undefined}
      fps={fps}
    />
  );
});
