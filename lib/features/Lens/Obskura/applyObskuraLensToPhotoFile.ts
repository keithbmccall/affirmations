import { buildObskuraLensPaintFromPipeline } from '@features/Lens/Obskura/pipeline/buildObskuraLensPaintFromPipeline';
import { OBSKURA_LENS_PIPELINE } from '@features/Lens/Obskura/pipeline/obskuraLensPipelineConfig';
import { type ObskuraColorMode } from '@features/Lens/Obskura/options';
import {
  ImageFormat,
  Skia,
  type SkData,
  type SkImage,
  type SkPaint,
  type SkSurface,
} from '@shopify/react-native-skia';
import { EncodingType, File, Paths } from 'expo-file-system';

const JPEG_QUALITY = 95;

export interface ApplyObskuraLensToPhotoFileParams {
  inputPath: string;
  colorMode: ObskuraColorMode;
}

function toFileUri(path: string): string {
  const trimmed = path.trim();
  if (trimmed.startsWith('file://')) {
    return trimmed;
  }
  return `file://${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

/**
 * Reads a still from `takePhoto`, applies the same Obskura lens as the live preview, writes a JPEG to cache, and returns a `file://` URI for `createCameraRollMediaAsset`.
 */
export async function applyObskuraLensToPhotoFile({
  inputPath,
  colorMode,
}: ApplyObskuraLensToPhotoFileParams): Promise<string> {
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
      throw new Error('Could not decode image for Obskura lens');
    }

    const width = sourceImage.width();
    const height = sourceImage.height();
    const outputShortSidePx = Math.min(width, height);
    lensPaint = buildObskuraLensPaintFromPipeline(OBSKURA_LENS_PIPELINE, {
      colorMode,
      outputShortSidePx,
    });

    surface = Skia.Surface.MakeOffscreen(width, height);
    if (!surface) {
      throw new Error('Could not create offscreen surface');
    }

    const canvas = surface.getCanvas();
    canvas.drawImage(sourceImage, 0, 0, lensPaint);
    surface.flush();
    snapshot = surface.makeImageSnapshot();

    const encoded = snapshot.encodeToBase64(ImageFormat.JPEG, JPEG_QUALITY);
    const outputFile = new File(Paths.cache, `lens-obskura-${Date.now()}.jpg`);
    outputFile.create({ intermediates: true, overwrite: true });
    outputFile.write(encoded, { encoding: EncodingType.Base64 });
    return outputFile.uri;
  } finally {
    snapshot?.dispose();
    surface?.dispose();
    sourceImage?.dispose();
    sourceData?.dispose();
    lensPaint?.dispose();
  }
}
