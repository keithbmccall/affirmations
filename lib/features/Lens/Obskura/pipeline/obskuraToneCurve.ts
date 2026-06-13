import type { ToneCurveStepSettings } from '@features/Lens/Obskura/pipeline/obskuraLensPipelineTypes';
import { Skia, type SkImageFilter, type SkRuntimeEffect } from '@shopify/react-native-skia';

const TONE_CURVE_SKSL = `
uniform shader image;
uniform float shadowLift;
uniform float highlightPull;

half4 main(float2 coord) {
  half4 c = image.eval(coord);
  float luma = dot(c.rgb, half3(0.213, 0.715, 0.072));
  float shadowW = 1.0 - smoothstep(0.0, 0.5, luma);
  float highlightW = smoothstep(0.5, 1.0, luma);
  c.rgb += half3(shadowLift * shadowW);
  c.rgb -= half3(highlightPull * highlightW);
  c.rgb = clamp(c.rgb, 0.0, 1.0);
  return c;
}
`;

let cachedToneCurveEffect: SkRuntimeEffect | null = null;

function getObskuraToneCurveEffect(): SkRuntimeEffect {
  if (cachedToneCurveEffect !== null) {
    return cachedToneCurveEffect;
  }

  const effect = Skia.RuntimeEffect.Make(TONE_CURVE_SKSL);
  if (effect === null) {
    throw new Error('Failed to compile Obskura tone curve runtime effect');
  }

  cachedToneCurveEffect = effect;
  return effect;
}

/**
 * Luma-weighted shadow lift and highlight pull. Chained after blur, before color grading.
 */
export function buildObskuraToneCurveImageFilter(
  input: SkImageFilter | null,
  settings: ToneCurveStepSettings
): SkImageFilter {
  const builder = Skia.RuntimeShaderBuilder(getObskuraToneCurveEffect());
  builder.setUniform('shadowLift', [settings.shadowLift]);
  builder.setUniform('highlightPull', [settings.highlightPull]);
  return Skia.ImageFilter.MakeRuntimeShader(builder, null, input);
}
