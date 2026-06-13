import { buildTameRedSaturationColorMatrix } from '@features/Lens/Obskura/pipeline/matrices/buildTameRedSaturationColorMatrix';
import { buildUniformSaturationColorMatrix } from '@features/Lens/Obskura/pipeline/matrices/buildUniformSaturationColorMatrix';
import { OBSKURA_COLOR_MODE } from '@features/Lens/Obskura/options';
import type {
  BuildObskuraLensPipelineContext,
  SaturationStepSettings,
} from '@features/Lens/Obskura/pipeline/obskuraLensPipelineTypes';
import { Skia, type SkColorFilter } from '@shopify/react-native-skia';

export function applySaturationPipelineStep(
  colorFilter: SkColorFilter | null,
  settings: SaturationStepSettings,
  context: BuildObskuraLensPipelineContext
): SkColorFilter {
  const matrix =
    context.colorMode === OBSKURA_COLOR_MODE.TAME_RED
      ? buildTameRedSaturationColorMatrix(settings.value)
      : buildUniformSaturationColorMatrix(settings.value);

  const stepFilter = Skia.ColorFilter.MakeMatrix(matrix);

  if (colorFilter === null) {
    return stepFilter;
  }

  return Skia.ColorFilter.MakeCompose(stepFilter, colorFilter);
}
