import {
  COLOR_LENS_MODE,
  isColorLensActive,
  isColorLensPoint,
  nextColorLensMode,
} from '@features/Lens/ColorPalette/colorLensMode';
import { snapshotPalette } from '@features/Lens/ColorPalette/snapshotPalette';
import type { LensPhotoCaptureContext } from '@features/Lens/ColorPalette/types';
import { useColorLensPalette } from '@features/Lens/ColorPalette/useColorLensPalette';
import { useColorLensRegion } from '@features/Lens/ColorPalette/useColorLensRegion';
import { useLens } from '@platform';
import { globalStyles } from '@styles/globalStyles';
import type { Asset } from 'expo-media-library';
import { memo, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import {
  runAtTargetFps,
  useFrameProcessor,
  Camera as VisionCamera,
} from 'react-native-vision-camera';
import { CameraBottomControls } from './CameraBottomControls';
import { useCameraSurface } from './CameraSurfaceContext';
import { LensCameraTopControls } from './LensCameraTopControls';
import { LensColorRegionIndicator } from './LensColorRegionIndicator';
import { LENS_POINT_SAMPLE_RADIUS } from './lensPointSampleRegion';

const ReanimatedCamera = Reanimated.createAnimatedComponent(VisionCamera);
Reanimated.addWhitelistedNativeProps({
  isActive: true,
});

export const COLOR_LENS_PALETTE_TARGET_FPS = 1;
export const COLOR_LENS_REGION_TARGET_FPS = 2;

const COLOR_ANIMATION_DURATION = 500;
const COLOR_LENS_FPS = 15;
const DEFAULT_FPS = 30;

export const LensCameraSurface = memo(function LensCameraSurface() {
  const { cameraRef, showPreview, isActive, device } = useCameraSurface();
  const { onAddLensPalette } = useLens();
  const { colorLensMode, setColorLensMode, palette, getColorLensPaletteWorklet } =
    useColorLensPalette();
  const { regionColor, getColorLensRegionWorklet } = useColorLensRegion();

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

      console.log('::::', {
        id: asset.id,
        uri: asset.uri,
        mediaType: asset.mediaType,
        type: COLOR_LENS_MODE.LENS_POINT,
        context,
      });

      const base = {
        id: asset.id,
        uri: asset.uri,
        mediaType: asset.mediaType,
      };

      if (context.type === COLOR_LENS_MODE.LENS_DOMINANT) {
        onAddLensPalette({
          ...base,
          type: COLOR_LENS_MODE.LENS_DOMINANT,
          palette: context.paletteSnapshot,
        });
        return;
      }

      if (context.type === COLOR_LENS_MODE.LENS_POINT) {
        onAddLensPalette({
          ...base,
          type: COLOR_LENS_MODE.LENS_POINT,
          lensPointColor: context.lensPointColor,
        });
      }
    },
    [onAddLensPalette]
  );

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (!isActive) return;

      switch (colorLensMode) {
        case COLOR_LENS_MODE.LENS_DOMINANT:
          runAtTargetFps(COLOR_LENS_PALETTE_TARGET_FPS, () => {
            'worklet';
            getColorLensPaletteWorklet(frame);
          });
          break;
        case COLOR_LENS_MODE.LENS_POINT:
          runAtTargetFps(COLOR_LENS_REGION_TARGET_FPS, () => {
            'worklet';
            getColorLensRegionWorklet(frame, {
              centerX: 0.5,
              centerY: 0.5,
              radius: LENS_POINT_SAMPLE_RADIUS,
            });
          });
          break;
        case COLOR_LENS_MODE.DISABLED:
        default:
          break;
      }
    },
    [isActive, colorLensMode, getColorLensPaletteWorklet, getColorLensRegionWorklet]
  );

  return (
    <View style={styles.surface}>
      {showPreview && device !== undefined && (
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
      )}
      <LensCameraTopControls
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
