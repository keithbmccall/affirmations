import { CameraBottomControls } from '@features/Lens/Camera/CameraBottomControls';
import { useCameraSurface } from '@features/Lens/Camera/CameraSurfaceContext';
import { CameraTopControls } from '@features/Lens/Camera/CameraTopControls';
import { applyObskuraLensToPhotoFile } from '@features/Lens/Obskura/applyObskuraLensToPhotoFile';
import { OBSKURA_COLOR_MODE, type ObskuraColorMode } from '@features/Lens/Obskura/options';
import { buildObskuraLensPaintFromPipeline } from '@features/Lens/Obskura/pipeline/buildObskuraLensPaintFromPipeline';
import { OBSKURA_LENS_PIPELINE } from '@features/Lens/Obskura/pipeline/obskuraLensPipelineConfig';
import { scheduleDeferredSkPaintDispose } from '@features/Lens/Obskura/scheduleDeferredSkPaintDispose';
import { globalStyles } from '@styles/globalStyles';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  CommonResolutions,
  type CameraDevice,
  type CameraPhotoOutput,
  type CameraRef,
  type Constraint,
  type Frame,
} from 'react-native-vision-camera';
import { SkiaCamera, type SkiaCameraRef, type SkiaOnFrameState } from 'react-native-vision-camera-skia';

const OBSKURA_FPS = 15;

interface ObskuraCameraPreviewProps {
  cameraRef: React.RefObject<CameraRef | null>;
  device: CameraDevice;
  isActive: boolean;
  colorMode: ObskuraColorMode;
  photoOutput: CameraPhotoOutput;
}

const ObskuraCameraPreview = memo(function ObskuraCameraPreview({
  cameraRef,
  device,
  isActive,
  colorMode,
  photoOutput,
}: ObskuraCameraPreviewProps) {
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

  const constraints = useMemo(
    (): Constraint[] => [{ fps: OBSKURA_FPS }, { resolutionBias: photoOutput }],
    [photoOutput]
  );

  const outputs = useMemo(() => [photoOutput], [photoOutput]);

  const onFrame = useCallback(
    (frame: Frame, render: (onDraw: (state: SkiaOnFrameState) => void) => void) => {
      'worklet';
      /* istanbul ignore next -- Skia render runs on device only */
      render(({ canvas, frameTexture }) => {
        canvas.drawImage(frameTexture, 0, 0, lensPaint);
      });
      frame.dispose();
    },
    [lensPaint]
  );

  return (
    <SkiaCamera
      ref={cameraRef as React.RefObject<SkiaCameraRef | null>}
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={isActive}
      outputs={outputs}
      constraints={constraints}
      targetResolution={CommonResolutions.FHD_16_9}
      onFrame={onFrame}
    />
  );
});

export const ObskuraCameraSurface = memo(function ObskuraCameraSurface() {
  const { cameraRef, photoOutput, showPreview, isActive, device } = useCameraSurface();
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
          photoOutput={photoOutput}
        />
      )}
      <CameraTopControls
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
