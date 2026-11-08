import { AlphaType, ColorType, Skia, type SkData, type SkImage } from '@shopify/react-native-skia';

const DEFAULT_PATCH_RADIUS = 2;

export interface FrozenFramePixels {
  width: number;
  height: number;
  /** Interleaved RGBA bytes, length === width * height * 4 */
  pixels: Uint8Array;
}

const toFileUri = (path: string): string => {
  const trimmed = path.trim();
  if (trimmed.startsWith('file://')) {
    return trimmed;
  }
  return `file://${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
};

const toHexByte = (value: number): string =>
  Math.min(255, Math.max(0, Math.round(value)))
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

/**
 * Averages a square patch of RGBA pixels around a center point into `#RRGGBB`.
 */
export const averageHexFromRgbaPixels = (
  pixels: Uint8Array,
  imageWidth: number,
  imageHeight: number,
  centerX: number,
  centerY: number,
  patchRadius: number = DEFAULT_PATCH_RADIUS
): string | undefined => {
  if (imageWidth <= 0 || imageHeight <= 0 || pixels.length < imageWidth * imageHeight * 4) {
    return undefined;
  }

  const minX = Math.max(0, centerX - patchRadius);
  const maxX = Math.min(imageWidth - 1, centerX + patchRadius);
  const minY = Math.max(0, centerY - patchRadius);
  const maxY = Math.min(imageHeight - 1, centerY + patchRadius);

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const index = (y * imageWidth + x) * 4;
      sumR += pixels[index] ?? 0;
      sumG += pixels[index + 1] ?? 0;
      sumB += pixels[index + 2] ?? 0;
      count += 1;
    }
  }

  if (count === 0) {
    return undefined;
  }

  return `#${toHexByte(sumR / count)}${toHexByte(sumG / count)}${toHexByte(sumB / count)}`;
};

/**
 * Decodes a still into an RGBA pixel buffer for frozen viewport sampling.
 */
export const loadFrozenFramePixels = async (pathOrUri: string): Promise<FrozenFramePixels> => {
  const sourceUri = toFileUri(pathOrUri);
  let sourceData: SkData | null = null;
  let sourceImage: SkImage | null = null;

  try {
    sourceData = await Skia.Data.fromURI(sourceUri);
    sourceImage = Skia.Image.MakeImageFromEncoded(sourceData);
    if (sourceImage === null) {
      throw new Error('Could not decode frozen frame image');
    }

    const width = sourceImage.width();
    const height = sourceImage.height();
    const pixels = sourceImage.readPixels(0, 0, {
      width,
      height,
      colorType: ColorType.RGBA_8888,
      alphaType: AlphaType.Unpremul,
    });

    if (!(pixels instanceof Uint8Array)) {
      throw new Error('Could not read frozen frame pixels');
    }

    return {
      width,
      height,
      pixels: new Uint8Array(pixels),
    };
  } finally {
    sourceImage?.dispose();
    sourceData?.dispose();
  }
};
