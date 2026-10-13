import type { CameraRollMediaAsset } from '@features/Lens/Camera/cameraRollPhotos/CameraRollMediaAsset';
import {
  COLOR_LENS_MODE,
  isColorLensActive,
  isColorLensPoint,
  nextColorLensMode,
} from '@features/Lens/ColorPalette/colorLensMode';
import { lensPaletteConfig } from '@features/Lens/ColorPalette/lensPaletteConfig';
import { requestColorNames } from '@features/Lens/ColorPalette/requestColorNames';
import { snapshotPalette } from '@features/Lens/ColorPalette/snapshotPalette';
import {
  toLensDominantPaletteColors,
  toLensNamedColor,
} from '@features/Lens/ColorPalette/toLensNamedColor';
import type { LensNamedColor, LensPhotoCaptureContext } from '@features/Lens/ColorPalette/types';
import { useColorLensPalette } from '@features/Lens/ColorPalette/useColorLensPalette';
import { useColorLensRegion } from '@features/Lens/ColorPalette/useColorLensRegion';
import { useLens } from '@platform';
import { globalStyles } from '@styles/globalStyles';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import {
  Camera as VisionCamera,
  useFrameOutput,
  usePhotoOutput,
  useVideoOutput,
  type Frame,
} from 'react-native-vision-camera';
import { useCameraSurface } from './CameraSurfaceContext';
import { LensColorRegionIndicator } from './LensColorRegionIndicator';
import { getLensPointSampleRect } from './lensPointSampleRegion';
import { shouldRunAtTargetFps } from './shouldRunAtTargetFps';

export const COLOR_LENS_PALETTE_TARGET_FPS = 2;
export const COLOR_LENS_REGION_TARGET_FPS = 10;

const COLOR_ANIMATION_DURATION = 150;
const DEFAULT_FPS = 30;
/** Stable across color-lens mode changes — VisionCamera reconfigures the session when constraints change. */
const CAMERA_CONSTRAINTS = [{ fps: DEFAULT_FPS }];
const COLOR_LENS_PALETTE_FPS_KEY = 'color-lens-palette';
const COLOR_LENS_REGION_FPS_KEY = 'color-lens-region';

const getCaptureHexes = (context: LensPhotoCaptureContext): string[] => {
  if (context.type === COLOR_LENS_MODE.LENS_POINT) {
    return [context.lensPointColor];
  }

  return lensPaletteConfig.colorPaletteKeys.map(key => context.paletteSnapshot[key]);
};

export const LensCameraSurface = memo(function LensCameraSurface() {
  const { cameraRef, showPreview, isActive, device, setChromeBindings } = useCameraSurface();
  const photoOutput = usePhotoOutput();
  const videoOutput = useVideoOutput({ enableAudio: true });
  const { onAddLensPalette } = useLens();
  const { colorLensMode, setColorLensMode, palette, getColorLensPaletteWorklet } =
    useColorLensPalette();
  const { regionColor, applyColorLensRegionWorklet } = useColorLensRegion();

  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  // Camera-space sample square corners (JS-thread view→camera conversion).
  const sampleCamX1 = useSharedValue(0);
  const sampleCamY1 = useSharedValue(0);
  const sampleCamX2 = useSharedValue(0);
  const sampleCamY2 = useSharedValue(0);
  const sampleCamReady = useSharedValue(0);

  // Camera-space viewport corners for dominant cover-crop (same geometry as former resizer cover).
  const viewportCamX1 = useSharedValue(0);
  const viewportCamY1 = useSharedValue(0);
  const viewportCamX2 = useSharedValue(0);
  const viewportCamY2 = useSharedValue(0);
  const viewportCamReady = useSharedValue(0);

  const updateSampleCameraRect = useCallback(
    (width: number, height: number) => {
      const camera = cameraRef.current;
      if (camera === null || width <= 0 || height <= 0) {
        sampleCamReady.value = 0;
        viewportCamReady.value = 0;
        return;
      }

      const sampleRect = getLensPointSampleRect({ x: 0, y: 0, width, height });
      if (sampleRect.size <= 0) {
        sampleCamReady.value = 0;
        viewportCamReady.value = 0;
        return;
      }

      try {
        const corner1 = camera.convertViewPointToCameraPoint({
          x: sampleRect.x,
          y: sampleRect.y,
        });
        const corner2 = camera.convertViewPointToCameraPoint({
          x: sampleRect.x + sampleRect.size,
          y: sampleRect.y + sampleRect.size,
        });
        sampleCamX1.value = corner1.x;
        sampleCamY1.value = corner1.y;
        sampleCamX2.value = corner2.x;
        sampleCamY2.value = corner2.y;
        sampleCamReady.value = 1;

        const viewportCorner1 = camera.convertViewPointToCameraPoint({ x: 0, y: 0 });
        const viewportCorner2 = camera.convertViewPointToCameraPoint({ x: width, y: height });
        viewportCamX1.value = viewportCorner1.x;
        viewportCamY1.value = viewportCorner1.y;
        viewportCamX2.value = viewportCorner2.x;
        viewportCamY2.value = viewportCorner2.y;
        viewportCamReady.value = 1;
      } catch {
        // Preview layer not ready yet — skip sampling until it is.
        sampleCamReady.value = 0;
        viewportCamReady.value = 0;
      }
    },
    [
      cameraRef,
      sampleCamReady,
      sampleCamX1,
      sampleCamX2,
      sampleCamY1,
      sampleCamY2,
      viewportCamReady,
      viewportCamX1,
      viewportCamX2,
      viewportCamY1,
      viewportCamY2,
    ]
  );

  const handleSurfaceLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setViewportSize({ width, height });
      updateSampleCameraRect(width, height);
    },
    [updateSampleCameraRect]
  );

  const handlePreviewStarted = useCallback(() => {
    updateSampleCameraRect(viewportSize.width, viewportSize.height);
  }, [updateSampleCameraRect, viewportSize.height, viewportSize.width]);

  useEffect(() => {
    updateSampleCameraRect(viewportSize.width, viewportSize.height);
  }, [device, updateSampleCameraRect, viewportSize.height, viewportSize.width]);

  const isColorLensModeActive = isColorLensActive(colorLensMode);

  const handleColorLensModeToggle = useCallback(
    () => setColorLensMode(prev => nextColorLensMode(prev)),
    [setColorLensMode]
  );

  const onPhotoCaptureStart = useCallback((): LensPhotoCaptureContext | undefined => {
    switch (colorLensMode) {
      case COLOR_LENS_MODE.LENS_DOMINANT:
        return {
          type: COLOR_LENS_MODE.LENS_DOMINANT,
          paletteSnapshot: snapshotPalette(palette),
        };
      case COLOR_LENS_MODE.LENS_POINT:
        return {
          type: COLOR_LENS_MODE.LENS_POINT,
          lensPointColor: regionColor.value,
        };
      case COLOR_LENS_MODE.DISABLED:
      default:
        return undefined;
    }
  }, [colorLensMode, palette, regionColor]);

  const onPhotoAssetSaved = useCallback(
    async (asset: CameraRollMediaAsset, context?: LensPhotoCaptureContext) => {
      if (context === undefined) return;

      const base = {
        id: asset.id,
        uri: asset.uri,
        mediaType: asset.mediaType,
      };

      const namedColors: LensNamedColor[] = await requestColorNames(
        getCaptureHexes(context)
      );

      if (context.type === COLOR_LENS_MODE.LENS_DOMINANT) {
        onAddLensPalette({
          ...base,
          type: COLOR_LENS_MODE.LENS_DOMINANT,
          palette: toLensDominantPaletteColors(context, namedColors),
        });
        return;
      }

      onAddLensPalette({
        ...base,
        type: COLOR_LENS_MODE.LENS_POINT,
        lensPointColor: toLensNamedColor(context, namedColors),
      });
    },
    [onAddLensPalette]
  );

  const onFrame = useCallback(
    (frame: Frame) => {
      'worklet';
      try {
        switch (colorLensMode) {
          case COLOR_LENS_MODE.LENS_DOMINANT:
            // Gate before throttle so "preview not ready" frames don't consume the FPS budget.
            if (viewportCamReady.value !== 1) {
              break;
            }
            if (!shouldRunAtTargetFps(COLOR_LENS_PALETTE_FPS_KEY, COLOR_LENS_PALETTE_TARGET_FPS)) {
              break;
            }
            {
              const framePoint1 = frame.convertCameraPointToFramePoint({
                x: viewportCamX1.value,
                y: viewportCamY1.value,
              });
              const framePoint2 = frame.convertCameraPointToFramePoint({
                x: viewportCamX2.value,
                y: viewportCamY2.value,
              });
              const left = Math.min(framePoint1.x, framePoint2.x);
              const right = Math.max(framePoint1.x, framePoint2.x);
              const top = Math.min(framePoint1.y, framePoint2.y);
              const bottom = Math.max(framePoint1.y, framePoint2.y);
              getColorLensPaletteWorklet(frame, { left, top, right, bottom });
            }
            break;
          case COLOR_LENS_MODE.LENS_POINT:
            // Gate before throttle so "preview not ready" frames don't consume the FPS budget.
            if (sampleCamReady.value !== 1) {
              break;
            }
            if (!shouldRunAtTargetFps(COLOR_LENS_REGION_FPS_KEY, COLOR_LENS_REGION_TARGET_FPS)) {
              break;
            }
            {
              const framePoint1 = frame.convertCameraPointToFramePoint({
                x: sampleCamX1.value,
                y: sampleCamY1.value,
              });
              const framePoint2 = frame.convertCameraPointToFramePoint({
                x: sampleCamX2.value,
                y: sampleCamY2.value,
              });
              const left = Math.min(framePoint1.x, framePoint2.x);
              const right = Math.max(framePoint1.x, framePoint2.x);
              const top = Math.min(framePoint1.y, framePoint2.y);
              const bottom = Math.max(framePoint1.y, framePoint2.y);
              applyColorLensRegionWorklet(frame, { left, top, right, bottom });
            }
            break;
          case COLOR_LENS_MODE.DISABLED:
          default:
            break;
        }
      } finally {
        frame.dispose();
      }
    },
    [
      colorLensMode,
      getColorLensPaletteWorklet,
      applyColorLensRegionWorklet,
      sampleCamReady,
      sampleCamX1,
      sampleCamY1,
      sampleCamX2,
      sampleCamY2,
      viewportCamReady,
      viewportCamX1,
      viewportCamY1,
      viewportCamX2,
      viewportCamY2,
    ]
  );

  const frameOutput = useFrameOutput({
    pixelFormat: 'yuv',
    enablePreviewSizedOutputBuffers: true,
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
    <View testID="lens-camera-surface" style={styles.surface} onLayout={handleSurfaceLayout}>
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
      {isColorLensPoint(colorLensMode) && (
        <LensColorRegionIndicator
          color={regionColor}
          animationDuration={COLOR_ANIMATION_DURATION}
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
