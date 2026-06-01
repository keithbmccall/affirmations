import { createSkiaLensPaint } from '@features/Lens/Obskura/createSkiaLensPaint';
import { type SkiaColorMode } from '@features/Lens/Obskura/obskuraOptions';
import {
  ImageFormat,
  Skia,
  type SkData,
  type SkImage,
  type SkPaint,
  type SkSurface,
} from '@shopify/react-native-skia';
import { cacheDirectory, EncodingType, writeAsStringAsync } from 'expo-file-system';

const JPEG_QUALITY = 95;

export interface ApplySkiaLensToPhotoFileParams {
  inputPath: string;
  colorMode: SkiaColorMode;
}

function toFileUri(path: string): string {
  const trimmed = path.trim();
  if (trimmed.startsWith('file://')) {
    return trimmed;
  }
  return `file://${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

/**
 * Reads a still from `takePhoto`, applies the same Skia lens as the live preview, writes a JPEG to cache, and returns a `file://` URI for `createAssetAsync`.
 */
export async function applySkiaLensToPhotoFile({
  inputPath,
  colorMode,
}: ApplySkiaLensToPhotoFileParams): Promise<string> {
  if (!cacheDirectory) {
    throw new Error('FileSystem.cacheDirectory is not available');
  }

  const sourceUri = toFileUri(inputPath);
  let lensPaint: SkPaint | null = null;
  let sourceData: SkData | null = null;
  let sourceImage: SkImage | null = null;
  let surface: SkSurface | null = null;
  let snapshot: SkImage | null = null;

  try {
    sourceData = await Skia.Data.fromURI(sourceUri);
    sourceImage = Skia.Image.MakeImageFromEncoded(sourceData);
    if (!sourceImage) {
      throw new Error('Could not decode image for Skia lens');
    }

    const width = sourceImage.width();
    const height = sourceImage.height();
    const outputShortSidePx = Math.min(width, height);
    lensPaint = createSkiaLensPaint(colorMode, { outputShortSidePx });

    surface = Skia.Surface.MakeOffscreen(width, height);
    if (!surface) {
      throw new Error('Could not create offscreen surface');
    }

    const canvas = surface.getCanvas();
    canvas.drawImage(sourceImage, 0, 0, lensPaint);
    surface.flush();
    snapshot = surface.makeImageSnapshot();

    const encoded = snapshot.encodeToBase64(ImageFormat.JPEG, JPEG_QUALITY);
    const outputUri = `${cacheDirectory}lens-skia-${Date.now()}.jpg`;
    await writeAsStringAsync(outputUri, encoded, { encoding: EncodingType.Base64 });
    return outputUri;
  } finally {
    snapshot?.dispose();
    surface?.dispose();
    sourceImage?.dispose();
    sourceData?.dispose();
    lensPaint?.dispose();
  }
}
