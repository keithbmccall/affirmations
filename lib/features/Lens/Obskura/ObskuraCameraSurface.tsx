import { CameraBottomControls } from '@features/Lens/Camera/CameraBottomControls';
import { useCameraSurface } from '@features/Lens/Camera/CameraSurfaceContext';
import { applyObskuraLensToPhotoFile } from '@features/Lens/Obskura/applyObskuraLensToPhotoFile';
import { buildObskuraLensPaintFromPipeline } from '@features/Lens/Obskura/pipeline/buildObskuraLensPaintFromPipeline';
import { OBSKURA_LENS_PIPELINE } from '@features/Lens/Obskura/pipeline/obskuraLensPipelineConfig';
import { OBSKURA_COLOR_MODE, type ObskuraColorMode } from '@features/Lens/Obskura/options';
import { ObskuraCameraTopControls } from '@features/Lens/Obskura/ObskuraCameraTopControls';
import { scheduleDeferredSkPaintDispose } from '@features/Lens/Obskura/scheduleDeferredSkPaintDispose';
import { globalStyles } from '@styles/globalStyles';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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

const OBSKURA_FPS = 15;

interface ObskuraCameraPreviewProps {
  cameraRef: React.RefObject<VisionCamera | null>;
  device: CameraDevice;
  isActive: boolean;
  colorMode: ObskuraColorMode;
}

const ObskuraCameraPreview = memo(function ObskuraCameraPreview({
  cameraRef,
  device,
  isActive,
  colorMode,
}: ObskuraCameraPreviewProps) {
  const formatFilters = useMemo(
    () => [{ fps: OBSKURA_FPS }, ...Templates.FrameProcessing, { photoResolution: 'max' as const }],
    []
  );
  const format = useCameraFormat(device, formatFilters);

  const lensPaint = useMemo(
    () => buildObskuraLensPaintFromPipeline(OBSKURA_LENS_PIPELINE, { colorMode }),
    [colorMode]
  );

  useEffect(() => {
    const paint = lensPaint;

    return () => {
      scheduleDeferredSkPaintDispose(paint);
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
      fps={OBSKURA_FPS}
    />
  );
});

export const ObskuraCameraSurface = memo(function ObskuraCameraSurface() {
  const { cameraRef, showPreview, isActive, device } = useCameraSurface();
  const [obskuraColorMode, setObskuraColorMode] = useState<ObskuraColorMode>(
    OBSKURA_COLOR_MODE.DEFAULT
  );

  const handleObskuraColorModeToggle = useCallback(() => {
    setObskuraColorMode(prev =>
      prev === OBSKURA_COLOR_MODE.DEFAULT ? OBSKURA_COLOR_MODE.TAME_RED : OBSKURA_COLOR_MODE.DEFAULT
    );
  }, []);

  const processPhotoPath = useCallback(
    (inputPath: string) =>
      applyObskuraLensToPhotoFile({
        inputPath,
        colorMode: obskuraColorMode,
      }),
    [obskuraColorMode]
  );

  return (
    <View style={styles.surface}>
      {showPreview && device !== undefined && (
        <ObskuraCameraPreview
          cameraRef={cameraRef}
          device={device}
          isActive={isActive}
          colorMode={obskuraColorMode}
        />
      )}
      <ObskuraCameraTopControls
        obskuraColorMode={obskuraColorMode}
        onObskuraColorModeToggle={handleObskuraColorModeToggle}
      />
      <CameraBottomControls processPhotoPath={processPhotoPath} />
    </View>
  );
});

const styles = StyleSheet.create({
  surface: {
    ...globalStyles.flex1,
    ...globalStyles.relative,
  },
});
