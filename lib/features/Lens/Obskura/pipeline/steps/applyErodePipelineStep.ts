import type { ErodeStepSettings } from '@features/Lens/Obskura/pipeline/obskuraLensPipelineTypes';
import { Skia, type SkImageFilter } from '@shopify/react-native-skia';

export function applyErodePipelineStep(
  imageFilter: SkImageFilter | null,
  settings: ErodeStepSettings
): SkImageFilter | null {
  if (settings.erodeRadius <= 0) {
    return imageFilter;
  }

  return Skia.ImageFilter.MakeErode(
    settings.erodeRadius,
    settings.erodeRadius,
    imageFilter
  );
}
