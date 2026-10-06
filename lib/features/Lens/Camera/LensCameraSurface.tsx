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
import type { Asset } from 'expo-media-library';
import { memo, useCallback, useMemo } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import {
  Camera as VisionCamera,
  useFrameOutput,
  type Frame,
} from 'react-native-vision-camera';
import { CameraBottomControls } from './CameraBottomControls';
import { useCameraSurface } from './CameraSurfaceContext';
import { CameraTopControls } from './CameraTopControls';
import { LensColorRegionIndicator } from './LensColorRegionIndicator';
import { LENS_POINT_REGION } from './lensPointSampleRegion';
import { runAtTargetFps } from './runAtTargetFps';

export const COLOR_LENS_PALETTE_TARGET_FPS = 1;
export const COLOR_LENS_REGION_TARGET_FPS = 2;

const COLOR_ANIMATION_DURATION = 500;
const COLOR_LENS_FPS = 15;
const DEFAULT_FPS = 30;

const getCaptureHexes = (context: LensPhotoCaptureContext): string[] => {
  if (context.type === COLOR_LENS_MODE.LENS_POINT) {
    return [context.lensPointColor];
  }

  return lensPaletteConfig.colorPaletteKeys.map(key => context.paletteSnapshot[key]);
};

export const LensCameraSurface = memo(function LensCameraSurface() {
  const { cameraRef, photoOutput, videoOutput, showPreview, isActive, device } = useCameraSurface();
  const { onAddLensPalette } = useLens();
  const { colorLensMode, setColorLensMode, palette, getColorLensPaletteWorklet } =
    useColorLensPalette();
  const { regionColor, getColorLensRegionWorklet } = useColorLensRegion();
  const viewportWidth = useSharedValue(0);
  const viewportHeight = useSharedValue(0);

  const handleSurfaceLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      viewportWidth.value = width;
      viewportHeight.value = height;
    },
    [viewportHeight, viewportWidth]
  );

  const isColorLensModeActive = isColorLensActive(colorLensMode);

  const fps = isActive && isColorLensModeActive ? COLOR_LENS_FPS : DEFAULT_FPS;

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
    async (asset: Asset, context?: LensPhotoCaptureContext) => {
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
        if (!isActive) {
          return;
        }

        switch (colorLensMode) {
          case COLOR_LENS_MODE.LENS_DOMINANT:
            runAtTargetFps(COLOR_LENS_PALETTE_TARGET_FPS, () => {
              'worklet';
              getColorLensPaletteWorklet(frame, {
                viewportWidth: viewportWidth.value,
                viewportHeight: viewportHeight.value,
              });
            });
            break;
          case COLOR_LENS_MODE.LENS_POINT:
            runAtTargetFps(COLOR_LENS_REGION_TARGET_FPS, () => {
              'worklet';
              getColorLensRegionWorklet(frame, {
                centerX: 0.5,
                centerY: 0.5,
                radius: LENS_POINT_REGION.sampleRadius,
                viewportWidth: viewportWidth.value,
                viewportHeight: viewportHeight.value,
              });
            });
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
      isActive,
      colorLensMode,
      getColorLensPaletteWorklet,
      getColorLensRegionWorklet,
      viewportWidth,
      viewportHeight,
    ]
  );

  const frameOutput = useFrameOutput({
    onFrame,
  });

  const outputs = useMemo(
    () => [photoOutput, videoOutput, frameOutput],
    [photoOutput, videoOutput, frameOutput]
  );

  const constraints = useMemo(() => [{ fps }], [fps]);

  return (
    <View testID="lens-camera-surface" style={styles.surface} onLayout={handleSurfaceLayout}>
      {showPreview && device !== undefined && (
        <VisionCamera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          outputs={outputs}
          constraints={constraints}
          resizeMode="cover"
        />
      )}
      <CameraTopControls
        colorLensMode={colorLensMode}
        palette={palette}
        colorAnimationDuration={COLOR_ANIMATION_DURATION}
        onColorLensModeToggle={handleColorLensModeToggle}
      />
      <CameraBottomControls
        enableVideoLongPress={!isColorLensModeActive}
        onPhotoCaptureStart={onPhotoCaptureStart}
        onPhotoAssetSaved={onPhotoAssetSaved}
      />
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
