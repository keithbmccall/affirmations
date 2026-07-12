import {
  isColorLensActive,
  isColorLensDominant,
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
import Reanimated, { useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor, Camera as VisionCamera } from 'react-native-vision-camera';
import { CameraBottomControls, type PhotoCaptureContext } from './CameraBottomControls';
import { useCameraSurface } from './CameraSurfaceContext';
import { LENS_POINT_SAMPLE_RADIUS } from './lensPointSampleRegion';
import { LensCameraTopControls } from './LensCameraTopControls';
import { LensColorRegionIndicator } from './LensColorRegionIndicator';

const ReanimatedCamera = Reanimated.createAnimatedComponent(VisionCamera);
Reanimated.addWhitelistedNativeProps({
  isActive: true,
});

export const COLOR_LENS_PALETTE_MIN_INTERVAL_MS = 1000;

const COLOR_ANIMATION_DURATION = 500;
const COLOR_LENS_FPS = 15;
const DEFAULT_FPS = 30;

export const LensCameraSurface = memo(function LensCameraSurface() {
  const { cameraRef, showPreview, isActive, device } = useCameraSurface();
  const { onAddLensPalette } = useLens();
  const { colorLensMode, setColorLensMode, palette, getColorLensPaletteWorklet } =
    useColorLensPalette();
  const { regionColor, getColorLensRegionWorklet } = useColorLensRegion();

  const lastColorLensPaletteSampleMs = useSharedValue(0);
  const shouldSampleDominant = isColorLensDominant(colorLensMode);
  const shouldSamplePoint = isColorLensPoint(colorLensMode);
  const isColorLensModeActive = isColorLensActive(colorLensMode);

  const fps = isActive && isColorLensModeActive ? COLOR_LENS_FPS : DEFAULT_FPS;

  const handleColorLensModeToggle = useCallback(
    () => setColorLensMode(prev => nextColorLensMode(prev)),
    [setColorLensMode]
  );

  const onPhotoCaptureStart = useCallback(
    (): LensPhotoCaptureContext => ({ paletteSnapshot: snapshotPalette(palette) }),
    [palette]
  );

  const onPhotoAssetSaved = useCallback(
    async (asset: Asset, context?: PhotoCaptureContext) => {
      if (!isColorLensDominant(colorLensMode)) return;
      const paletteSnapshot = (context as LensPhotoCaptureContext | undefined)?.paletteSnapshot;
      if (paletteSnapshot === undefined) return;
      onAddLensPalette({
        id: asset.id,
        uri: asset.uri,
        mediaType: asset.mediaType,
        palette: paletteSnapshot,
      });
    },
    [colorLensMode, onAddLensPalette]
  );

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

          if (shouldSamplePoint) {
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
