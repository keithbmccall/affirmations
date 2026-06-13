import { buildLinearContrastColorMatrix } from '@features/Lens/Obskura/pipeline/matrices/buildLinearContrastColorMatrix';
import type { ContrastStepSettings } from '@features/Lens/Obskura/pipeline/obskuraLensPipelineTypes';
import { Skia, type SkColorFilter } from '@shopify/react-native-skia';

export function applyContrastPipelineStep(
  colorFilter: SkColorFilter | null,
  settings: ContrastStepSettings
): SkColorFilter {
  const stepFilter = Skia.ColorFilter.MakeMatrix(buildLinearContrastColorMatrix(settings.value));

  if (colorFilter === null) {
    return stepFilter;
  }

  return Skia.ColorFilter.MakeCompose(stepFilter, colorFilter);
}
