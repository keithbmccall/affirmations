import type {
  BuildObskuraLensPipelineContext,
  ObskuraLensPipelineStep,
} from '@features/Lens/Obskura/pipeline/obskuraLensPipelineTypes';
import { applyBlurPipelineStep } from '@features/Lens/Obskura/pipeline/steps/applyBlurPipelineStep';
import { applyBrightnessPipelineStep } from '@features/Lens/Obskura/pipeline/steps/applyBrightnessPipelineStep';
import { applyContrastPipelineStep } from '@features/Lens/Obskura/pipeline/steps/applyContrastPipelineStep';
import { applyErodePipelineStep } from '@features/Lens/Obskura/pipeline/steps/applyErodePipelineStep';
import { applySaturationPipelineStep } from '@features/Lens/Obskura/pipeline/steps/applySaturationPipelineStep';
import { applyToneCurvePipelineStep } from '@features/Lens/Obskura/pipeline/steps/applyToneCurvePipelineStep';
import { Skia, type SkPaint } from '@shopify/react-native-skia';

/**
 * Builds Obskura lens paint from a declarative step list. Caller owns `dispose()`.
 *
 * Engine invariants (must match legacy `createObskuraLensPaint` graph):
 * - Image steps chain onto `imageFilter` (each step receives the previous filter as input).
 * - Color steps compose with `MakeCompose(stepFilter, colorFilter)` so the first color
 *   step in the array is innermost (brightness → contrast → saturation).
 * - Image and color steps populate independent chains; interleaving in the array does not
 *   change the final merge — color grading is always applied via `MakeColorFilter` on top
 *   of the image chain when both exist.
 */
export function buildObskuraLensPaintFromPipeline(
  steps: ObskuraLensPipelineStep[],
  context: BuildObskuraLensPipelineContext
): SkPaint {
  let imageFilter = null;
  let colorFilter = null;

  for (const step of steps) {
    switch (step.action) {
      case 'erode':
        imageFilter = applyErodePipelineStep(imageFilter, step.settings);
        break;
      case 'blur':
        imageFilter = applyBlurPipelineStep(imageFilter, step.settings, context);
        break;
      case 'toneCurve':
        imageFilter = applyToneCurvePipelineStep(imageFilter, step.settings);
        break;
      case 'brightness':
        colorFilter = applyBrightnessPipelineStep(colorFilter, step.settings);
        break;
      case 'contrast':
        colorFilter = applyContrastPipelineStep(colorFilter, step.settings);
        break;
      case 'saturation':
        colorFilter = applySaturationPipelineStep(colorFilter, step.settings, context);
        break;
    }
  }

  const paint = Skia.Paint();

  if (colorFilter !== null && imageFilter !== null) {
    paint.setImageFilter(Skia.ImageFilter.MakeColorFilter(colorFilter, imageFilter));
  } else if (imageFilter !== null) {
    paint.setImageFilter(imageFilter);
  } else if (colorFilter !== null) {
    paint.setImageFilter(Skia.ImageFilter.MakeColorFilter(colorFilter, null));
  }

  return paint;
}
