import type { CameraRollMediaAsset } from '@features/Lens/Camera/cameraRollPhotos/CameraRollMediaAsset';
import {
  COLOR_LENS_MODE,
  isColorLensActive,
  nextColorLensMode,
} from '@features/Lens/ColorPalette/colorLensMode';
import { lensPaletteConfig } from '@features/Lens/ColorPalette/lensPaletteConfig';
import { requestColorNames } from '@features/Lens/ColorPalette/requestColorNames';
import { snapshotPalette } from '@features/Lens/ColorPalette/snapshotPalette';
import { toLensDominantPaletteColors } from '@features/Lens/ColorPalette/toLensNamedColor';
import type { LensNamedColor, LensPhotoCaptureContext } from '@features/Lens/ColorPalette/types';
import { LENS_PALETTE_TYPE } from '@features/Lens/ColorPalette/types';
import { useColorLensPalette } from '@features/Lens/ColorPalette/useColorLensPalette';
import { useLens } from '@platform';
import { globalStyles } from '@styles/globalStyles';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import {
  Camera as VisionCamera,
  useFrameOutput,
  usePhotoOutput,
  useVideoOutput,
  type Frame,
} from 'react-native-vision-camera';
import { useCameraSurface } from './CameraSurfaceContext';
import { useLensCameraSampleRects } from './hooks/useLensCameraSampleRects';
import { runGatedColorLensSample } from './runGatedColorLensSample';

export const COLOR_LENS_PALETTE_TARGET_FPS = 2;

const COLOR_ANIMATION_DURATION = 150;
const DEFAULT_FPS = 30;
/** Stable across color-lens mode changes — VisionCamera reconfigures the session when constraints change. */
const CAMERA_CONSTRAINTS = [{ fps: DEFAULT_FPS }];
const COLOR_LENS_PALETTE_FPS_KEY = 'color-lens-palette';

const getCaptureHexes = (context: LensPhotoCaptureContext): string[] =>
  lensPaletteConfig.colorPaletteKeys.map(key => context.paletteSnapshot[key]);

export const LensCameraSurface = memo(function LensCameraSurface() {
  const { cameraRef, showPreview, isActive, device, setChromeBindings } = useCameraSurface();
  const photoOutput = usePhotoOutput();
  const videoOutput = useVideoOutput({ enableAudio: true });
  const { onAddLensPalette } = useLens();
  const { colorLensMode, setColorLensMode, palette, getColorLensPaletteWorklet } =
    useColorLensPalette();
  const { viewportCorners, updateViewportCameraRect } = useLensCameraSampleRects(cameraRef);

  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  const handleSurfaceLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setViewportSize({ width, height });
      updateViewportCameraRect(width, height);
    },
    [updateViewportCameraRect]
  );

  const handlePreviewStarted = useCallback(() => {
    updateViewportCameraRect(viewportSize.width, viewportSize.height);
  }, [updateViewportCameraRect, viewportSize.height, viewportSize.width]);

  useEffect(() => {
    updateViewportCameraRect(viewportSize.width, viewportSize.height);
  }, [device, updateViewportCameraRect, viewportSize.height, viewportSize.width]);

  const isColorLensModeActive = isColorLensActive(colorLensMode);

  const handleColorLensModeToggle = useCallback(
    () => setColorLensMode(prev => nextColorLensMode(prev)),
    [setColorLensMode]
  );

  const onPhotoCaptureStart = useCallback((): LensPhotoCaptureContext | undefined => {
    if (colorLensMode !== COLOR_LENS_MODE.LENS_DOMINANT) {
      return undefined;
    }
    return {
      type: LENS_PALETTE_TYPE.DOMINANT,
      paletteSnapshot: snapshotPalette(palette),
    };
  }, [colorLensMode, palette]);

  const onPhotoAssetSaved = useCallback(
    async (asset: CameraRollMediaAsset, context?: LensPhotoCaptureContext) => {
      if (context === undefined) return;

      const namedColors: LensNamedColor[] = await requestColorNames(getCaptureHexes(context));

      onAddLensPalette({
        id: asset.id,
        uri: asset.uri,
        mediaType: asset.mediaType,
        type: LENS_PALETTE_TYPE.DOMINANT,
        palette: toLensDominantPaletteColors(context, namedColors),
      });
    },
    [onAddLensPalette]
  );

  const onFrame = useCallback(
    (frame: Frame) => {
      'worklet';
      try {
        if (colorLensMode === COLOR_LENS_MODE.LENS_DOMINANT) {
          runGatedColorLensSample(frame, {
            ...viewportCorners,
            fpsKey: COLOR_LENS_PALETTE_FPS_KEY,
            targetFps: COLOR_LENS_PALETTE_TARGET_FPS,
            apply: getColorLensPaletteWorklet,
          });
        }
      } finally {
        frame.dispose();
      }
    },
    [colorLensMode, getColorLensPaletteWorklet, viewportCorners]
  );

  const frameOutput = useFrameOutput({
    pixelFormat: 'yuv',
    enablePreviewSizedOutputBuffers: true,
    enablePhysicalBufferRotation: true,
    onFrame,
  });

  const outputs = useMemo(
    () => [photoOutput, videoOutput, frameOutput],
    [photoOutput, videoOutput, frameOutput]
  );

  const chromeBindings = useMemo(
    () => ({
      colorLensMode,
      palette,
      colorAnimationDuration: COLOR_ANIMATION_DURATION,
      onColorLensModeToggle: handleColorLensModeToggle,
      photoOutput,
      videoOutput,
      enableVideoLongPress: !isColorLensModeActive,
      onPhotoCaptureStart,
      onPhotoAssetSaved,
    }),
    [
      colorLensMode,
      palette,
      handleColorLensModeToggle,
      photoOutput,
      videoOutput,
      isColorLensModeActive,
      onPhotoCaptureStart,
      onPhotoAssetSaved,
    ]
  );

  useEffect(() => {
    setChromeBindings(chromeBindings);

    return () => {
      setChromeBindings(null);
    };
  }, [chromeBindings, setChromeBindings]);

  return (
    <View
      testID="lens-camera-surface"
      collapsable={false}
      style={styles.surface}
      onLayout={handleSurfaceLayout}
    >
      {showPreview && device !== undefined && (
        <VisionCamera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          outputs={outputs}
          constraints={CAMERA_CONSTRAINTS}
          resizeMode="cover"
          onPreviewStarted={handlePreviewStarted}
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
