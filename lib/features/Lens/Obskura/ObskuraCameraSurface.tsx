import { useCameraSurface } from '@features/Lens/Camera/CameraSurfaceContext';
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
  usePhotoOutput,
  type CameraDevice,
  type CameraPhotoOutput,
  type CameraRef,
  type Constraint,
  type Frame,
} from 'react-native-vision-camera';
import { SkiaCamera, type SkiaCameraRef, type SkiaOnFrameState } from 'react-native-vision-camera-skia';

const OBSKURA_FPS = 15;
/** Short side of {@link CommonResolutions.HD_16_9} — scales blur sigma to match FHD look. */
const OBSKURA_PREVIEW_SHORT_SIDE_PX = 720;

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
    () =>
      buildObskuraLensPaintFromPipeline(OBSKURA_LENS_PIPELINE, {
        colorMode,
        outputShortSidePx: OBSKURA_PREVIEW_SHORT_SIDE_PX,
      }),
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
      targetResolution={CommonResolutions.HD_16_9}
      onFrame={onFrame}
    />
  );
});

export const ObskuraCameraSurface = memo(function ObskuraCameraSurface() {
  const { cameraRef, showPreview, isActive, device, setChromeBindings } = useCameraSurface();
  // JPEG required — Skia MakeImageFromEncoded cannot decode iOS native HEIC.
  const photoOutput = usePhotoOutput({
    containerFormat: 'jpeg',
    quality: 1,
    qualityPrioritization: 'quality',
  });
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

  const chromeBindings = useMemo(
    () => ({
      obskuraColorMode,
      onObskuraColorModeToggle: handleObskuraColorModeToggle,
      photoOutput,
      processPhotoPath,
    }),
    [obskuraColorMode, handleObskuraColorModeToggle, photoOutput, processPhotoPath]
  );

  useEffect(() => {
    setChromeBindings(chromeBindings);

    return () => {
      setChromeBindings(null);
    };
  }, [chromeBindings, setChromeBindings]);

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
    </View>
  );
});

const styles = StyleSheet.create({
  surface: {
    ...globalStyles.flex1,
    ...globalStyles.relative,
  },
});
