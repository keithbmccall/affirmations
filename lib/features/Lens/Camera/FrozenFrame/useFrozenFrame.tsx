import { Image } from 'expo-image';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import type { CameraPhotoOutput } from 'react-native-vision-camera';
import { coverCropTapToImagePixel } from './coverCropTapToImagePixel';
import { FrozenTapColorIndicator } from './FrozenTapColorIndicator';
import {
  averageHexFromRgbaPixels,
  loadFrozenFramePixels,
  type FrozenFramePixels,
} from './sampleFrozenFrameColor';

const toFileUri = (path: string): string => {
  const trimmed = path.trim();
  if (trimmed.startsWith('file://')) {
    return trimmed;
  }
  return `file://${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
};

interface FrozenTapSample {
  x: number;
  y: number;
  hex: string;
}

export interface UseFrozenFrameParams {
  photoOutput: CameraPhotoOutput;
  viewportWidth: number;
  viewportHeight: number;
}

export interface UseFrozenFrameResult {
  isFrozen: boolean;
  onFreezeToggle: () => Promise<void>;
  onFrozenTap: (x: number, y: number) => void;
  /** When false, VisionCamera should set `isActive={false}`. */
  isCameraActiveGate: boolean;
  overlay: ReactNode;
}

export const useFrozenFrame = ({
  photoOutput,
  viewportWidth,
  viewportHeight,
}: UseFrozenFrameParams): UseFrozenFrameResult => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [freezeUri, setFreezeUri] = useState<string | null>(null);
  const [frozenTapSample, setFrozenTapSample] = useState<FrozenTapSample | null>(null);
  const [isFreezeCapturing, setIsFreezeCapturing] = useState(false);
  const freezePixelsRef = useRef<FrozenFramePixels | null>(null);

  const clearFreezeState = useCallback(() => {
    freezePixelsRef.current = null;
    setFreezeUri(null);
    setFrozenTapSample(null);
    setIsFrozen(false);
  }, []);

  const onFreezeToggle = useCallback(async () => {
    if (isFreezeCapturing) {
      return;
    }

    if (isFrozen) {
      clearFreezeState();
      return;
    }

    setIsFreezeCapturing(true);
    try {
      const photoFile = await photoOutput.capturePhotoToFile(
        {
          flashMode: 'off',
          enableShutterSound: false,
        },
        {}
      );
      const uri = toFileUri(photoFile.filePath);
      const pixels = await loadFrozenFramePixels(uri);
      freezePixelsRef.current = pixels;
      setFreezeUri(uri);
      setFrozenTapSample(null);
      setIsFrozen(true);
    } catch (error) {
      console.error('Freeze frame capture failed', error);
      clearFreezeState();
    } finally {
      setIsFreezeCapturing(false);
    }
  }, [clearFreezeState, isFreezeCapturing, isFrozen, photoOutput]);

  const onFrozenTap = useCallback(
    (x: number, y: number) => {
      if (!isFrozen) {
        return;
      }

      const freezePixels = freezePixelsRef.current;
      if (freezePixels === null || viewportWidth <= 0 || viewportHeight <= 0) {
        return;
      }

      const imagePoint = coverCropTapToImagePixel({
        tapX: x,
        tapY: y,
        viewportWidth,
        viewportHeight,
        imageWidth: freezePixels.width,
        imageHeight: freezePixels.height,
      });
      if (imagePoint === undefined) {
        return;
      }

      const hex = averageHexFromRgbaPixels(
        freezePixels.pixels,
        freezePixels.width,
        freezePixels.height,
        imagePoint.x,
        imagePoint.y
      );
      if (hex === undefined) {
        return;
      }

      setFrozenTapSample({ x, y, hex });
    },
    [isFrozen, viewportHeight, viewportWidth]
  );

  const freezeImageSource = useMemo(
    () => (freezeUri !== null ? { uri: freezeUri } : undefined),
    [freezeUri]
  );

  const overlay = useMemo(() => {
    if (!isFrozen || freezeImageSource === undefined) {
      return null;
    }

    return (
      <>
        <Image
          testID="lens-freeze-frame-overlay"
          source={freezeImageSource}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        {frozenTapSample !== null ? (
          <FrozenTapColorIndicator
            x={frozenTapSample.x}
            y={frozenTapSample.y}
            hex={frozenTapSample.hex}
          />
        ) : null}
      </>
    );
  }, [freezeImageSource, frozenTapSample, isFrozen]);

  return {
    isFrozen,
    onFreezeToggle,
    onFrozenTap,
    isCameraActiveGate: !isFrozen,
    overlay,
  };
};
