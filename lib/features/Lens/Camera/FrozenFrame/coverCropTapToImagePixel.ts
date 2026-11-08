export interface CoverCropTapToImagePixelParams {
  tapX: number;
  tapY: number;
  viewportWidth: number;
  viewportHeight: number;
  imageWidth: number;
  imageHeight: number;
}

export interface ImagePixelPoint {
  x: number;
  y: number;
}

/**
 * Maps a viewport tap into image pixel coordinates for `resizeMode="cover"`.
 */
export const coverCropTapToImagePixel = ({
  tapX,
  tapY,
  viewportWidth,
  viewportHeight,
  imageWidth,
  imageHeight,
}: CoverCropTapToImagePixelParams): ImagePixelPoint | undefined => {
  if (
    viewportWidth <= 0 ||
    viewportHeight <= 0 ||
    imageWidth <= 0 ||
    imageHeight <= 0
  ) {
    return undefined;
  }

  const scale = Math.max(viewportWidth / imageWidth, viewportHeight / imageHeight);
  const displayedWidth = imageWidth * scale;
  const displayedHeight = imageHeight * scale;
  const offsetX = (displayedWidth - viewportWidth) / 2;
  const offsetY = (displayedHeight - viewportHeight) / 2;

  const imageX = (tapX + offsetX) / scale;
  const imageY = (tapY + offsetY) / scale;

  return {
    x: Math.min(imageWidth - 1, Math.max(0, Math.round(imageX))),
    y: Math.min(imageHeight - 1, Math.max(0, Math.round(imageY))),
  };
};
