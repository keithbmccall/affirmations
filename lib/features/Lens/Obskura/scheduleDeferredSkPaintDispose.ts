import { type SkPaint } from '@shopify/react-native-skia';

/** Wait for VisionCamera to detach the frame processor before releasing SkPaint. */
export function scheduleDeferredSkPaintDispose(paint: SkPaint): () => void {
  let cancelled = false;
  let innerRafId: number | undefined;

  const outerRafId = requestAnimationFrame(() => {
    innerRafId = requestAnimationFrame(() => {
      if (!cancelled) {
        paint.dispose();
      }
    });
  });

  return () => {
    cancelled = true;
    cancelAnimationFrame(outerRafId);
    if (innerRafId !== undefined) {
      cancelAnimationFrame(innerRafId);
    }
  };
}
