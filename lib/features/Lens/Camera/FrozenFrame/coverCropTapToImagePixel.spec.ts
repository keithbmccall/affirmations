import { coverCropTapToImagePixel } from './coverCropTapToImagePixel';

describe('coverCropTapToImagePixel', () => {
  it('returns undefined for non-positive dimensions', () => {
    expect(
      coverCropTapToImagePixel({
        tapX: 10,
        tapY: 10,
        viewportWidth: 0,
        viewportHeight: 100,
        imageWidth: 100,
        imageHeight: 100,
      })
    ).toBeUndefined();
  });

  it('maps the viewport center to the image center when aspects match', () => {
    expect(
      coverCropTapToImagePixel({
        tapX: 50,
        tapY: 100,
        viewportWidth: 100,
        viewportHeight: 200,
        imageWidth: 100,
        imageHeight: 200,
      })
    ).toEqual({ x: 50, y: 100 });
  });

  it('maps corners for a landscape image covering a portrait viewport', () => {
    // image 200x100, viewport 100x100 → scale=1, displayed 200x100, offsetX=50
    expect(
      coverCropTapToImagePixel({
        tapX: 0,
        tapY: 0,
        viewportWidth: 100,
        viewportHeight: 100,
        imageWidth: 200,
        imageHeight: 100,
      })
    ).toEqual({ x: 50, y: 0 });

    expect(
      coverCropTapToImagePixel({
        tapX: 99,
        tapY: 99,
        viewportWidth: 100,
        viewportHeight: 100,
        imageWidth: 200,
        imageHeight: 100,
      })
    ).toEqual({ x: 149, y: 99 });
  });

  it('clamps taps that fall outside the viewport into image bounds', () => {
    expect(
      coverCropTapToImagePixel({
        tapX: -20,
        tapY: 500,
        viewportWidth: 100,
        viewportHeight: 100,
        imageWidth: 50,
        imageHeight: 50,
      })
    ).toEqual({ x: 0, y: 49 });
  });
});
