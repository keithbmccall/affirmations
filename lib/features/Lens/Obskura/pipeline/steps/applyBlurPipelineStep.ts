import type {
  BlurStepSettings,
  BuildObskuraLensPipelineContext,
} from '@features/Lens/Obskura/pipeline/obskuraLensPipelineTypes';
import { Skia, TileMode, type SkImageFilter } from '@shopify/react-native-skia';

export function applyBlurPipelineStep(
  imageFilter: SkImageFilter | null,
  settings: BlurStepSettings,
  context: BuildObskuraLensPipelineContext
): SkImageFilter {
  const referenceShortSide = settings.referenceShortSide ?? 1080;
  const blurSigma =
    context.outputShortSidePx !== undefined
      ? (settings.sigma * context.outputShortSidePx) / referenceShortSide
      : settings.sigma;

  return Skia.ImageFilter.MakeBlur(blurSigma, blurSigma, TileMode.Clamp, imageFilter);
}
