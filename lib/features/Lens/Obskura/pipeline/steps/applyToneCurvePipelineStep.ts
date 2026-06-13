import { buildObskuraToneCurveImageFilter } from '@features/Lens/Obskura/pipeline/obskuraToneCurve';
import type { ToneCurveStepSettings } from '@features/Lens/Obskura/pipeline/obskuraLensPipelineTypes';
import type { SkImageFilter } from '@shopify/react-native-skia';

export function applyToneCurvePipelineStep(
  imageFilter: SkImageFilter | null,
  settings: ToneCurveStepSettings
): SkImageFilter {
  return buildObskuraToneCurveImageFilter(imageFilter, settings);
}
