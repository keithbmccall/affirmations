import { buildBrightnessColorMatrix } from '@features/Lens/Obskura/pipeline/matrices/buildBrightnessColorMatrix';
import type { BrightnessStepSettings } from '@features/Lens/Obskura/pipeline/obskuraLensPipelineTypes';
import { Skia, type SkColorFilter } from '@shopify/react-native-skia';

export function applyBrightnessPipelineStep(
  colorFilter: SkColorFilter | null,
  settings: BrightnessStepSettings
): SkColorFilter {
  const stepFilter = Skia.ColorFilter.MakeMatrix(buildBrightnessColorMatrix(settings.value));

  if (colorFilter === null) {
    return stepFilter;
  }

  return Skia.ColorFilter.MakeCompose(stepFilter, colorFilter);
}
